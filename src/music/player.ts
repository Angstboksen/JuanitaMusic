import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
  type VoiceConnection,
  type AudioPlayer,
  type AudioResource,
  type DiscordGatewayAdapterCreator,
} from "@discordjs/voice";
import type { ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { Queue } from "./queue.js";
import type { Track } from "./track.js";
import { createStream } from "./stream.js";

const MAX_PREVIOUS = 10;

export interface MusicPlayerOptions {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  adapterCreator: DiscordGatewayAdapterCreator;
  volume?: number;
}

export class MusicPlayer extends EventEmitter {
  public readonly guildId: string;
  public voiceChannelId: string;
  public textChannelId: string;
  public connection: VoiceConnection;
  public audioPlayer: AudioPlayer;
  public queue: Queue;
  public volume: number;

  private seekOffset = 0;
  private currentProcess: ChildProcess | null = null;
  private currentResource: AudioResource | null = null;
  private autoAdvanceEnabled = true;
  private destroyed = false;

  constructor(options: MusicPlayerOptions) {
    super();

    this.guildId = options.guildId;
    this.voiceChannelId = options.voiceChannelId;
    this.textChannelId = options.textChannelId;
    this.volume = options.volume ?? 50;
    this.queue = new Queue();

    // Create voice connection (selfDeaf: false enables audio receiving)
    this.connection = joinVoiceChannel({
      channelId: options.voiceChannelId,
      guildId: options.guildId,
      adapterCreator: options.adapterCreator,
      selfDeaf: false,
    });

    // Create audio player and subscribe connection
    this.audioPlayer = createAudioPlayer();
    this.connection.subscribe(this.audioPlayer);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Auto-advance when a track finishes
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      this.killCurrentProcess();

      if (!this.autoAdvanceEnabled) return;

      // Emit trackEnd for the finished track
      if (this.queue.current) {
        this.emit("trackEnd", this, this.queue.current);
        this.queue.previous.unshift(this.queue.current);
        if (this.queue.previous.length > MAX_PREVIOUS) this.queue.previous.pop();
      }

      // Advance to next track
      const next = this.queue.shift();
      if (next) {
        this.queue.current = next;
        this.playCurrentTrack();
        this.emit("trackStart", this, next);
      } else {
        this.queue.current = null;
        this.emit("queueEmpty", this);
      }
    });

    // Handle audio player errors
    this.audioPlayer.on("error", (error) => {
      console.error(`[Player] ${this.guildId}: Audio error:`, error.message);
      this.killCurrentProcess();
      // Try to skip to next track
      this.audioPlayer.stop();
    });

    // Handle voice connection disconnect
    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        // Real disconnect - destroy
        if (!this.destroyed) this.destroy();
      }
    });
  }

  /**
   * Start playing. If a track is provided, play it immediately.
   * Otherwise, start playing from the queue.
   */
  play(track?: Track): void {
    if (this.destroyed) return;

    if (track) {
      // Playing a specific track - suppress auto-advance from stop
      this.autoAdvanceEnabled = false;
      this.killCurrentProcess();
      this.audioPlayer.stop();
      this.autoAdvanceEnabled = true;

      // Move current to previous
      if (this.queue.current) {
        this.queue.previous.unshift(this.queue.current);
        if (this.queue.previous.length > MAX_PREVIOUS) this.queue.previous.pop();
      }

      this.queue.current = track;
      this.playCurrentTrack();
      this.emit("trackStart", this, track);
    } else if (!this.queue.current) {
      // Initial play from queue
      const next = this.queue.shift();
      if (next) {
        this.queue.current = next;
        this.playCurrentTrack();
        this.emit("trackStart", this, next);
      }
    }
  }

  skip(): void {
    if (this.destroyed) return;
    // stop() triggers the Idle handler which auto-advances
    this.audioPlayer.stop();
  }

  pause(paused: boolean): void {
    if (this.destroyed) return;
    if (paused) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.unpause();
    }
  }

  async seekTo(ms: number): Promise<void> {
    if (this.destroyed || !this.queue.current) return;

    this.autoAdvanceEnabled = false;
    this.killCurrentProcess();
    this.audioPlayer.stop();
    this.autoAdvanceEnabled = true;

    await this.playCurrentTrack(ms);
  }

  setVolume(n: number): void {
    this.volume = Math.max(0, Math.min(100, n));
    if (this.currentResource?.volume) {
      this.currentResource.volume.setVolume(this.volume / 100);
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.killCurrentProcess();
    this.audioPlayer.stop(true);

    try {
      this.connection.destroy();
    } catch {
      // Connection may already be destroyed
    }

    this.emit("destroyed", this);
    this.removeAllListeners();
  }

  // --- Properties ---

  get playing(): boolean {
    return this.audioPlayer.state.status === AudioPlayerStatus.Playing;
  }

  get paused(): boolean {
    return this.audioPlayer.state.status === AudioPlayerStatus.Paused;
  }

  get position(): number {
    const state = this.audioPlayer.state;
    if (
      state.status === AudioPlayerStatus.Playing ||
      state.status === AudioPlayerStatus.Paused
    ) {
      return this.seekOffset + state.playbackDuration;
    }
    return this.seekOffset;
  }

  // --- Private ---

  private async playCurrentTrack(seekMs = 0): Promise<void> {
    if (!this.queue.current || this.destroyed) return;

    this.seekOffset = seekMs;
    const seekSeconds = Math.floor(seekMs / 1000);

    try {
      const { stream, process } = await createStream(this.queue.current.url, seekSeconds);
      this.currentProcess = process;

      // Handle process exit errors
      process.on("error", (err) => {
        console.error(`[Player] ${this.guildId}: Stream process error:`, err.message);
      });

      const resource = createAudioResource(stream, {
        inputType: StreamType.Raw,
        inlineVolume: true,
      });

      resource.volume?.setVolume(this.volume / 100);
      this.currentResource = resource;
      this.audioPlayer.play(resource);
    } catch (error) {
      console.error(`[Player] ${this.guildId}: Failed to play ${this.queue.current.title}:`, error);
      // Skip to next track on error
      this.audioPlayer.stop();
    }
  }

  private killCurrentProcess(): void {
    if (this.currentProcess) {
      this.currentProcess.kill("SIGKILL");
      this.currentProcess = null;
    }
    this.currentResource = null;
  }
}
