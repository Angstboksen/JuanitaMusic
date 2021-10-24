import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Track } from "./Track";
import { promisify } from "util";
import { Song } from "../types";
import { Message } from "discord.js";
import yts from "yt-search";
import { YTSearcher } from "../logic/YTSearcher";

const wait = promisify(setTimeout);

export class JuanitaSubscription {
  public readonly voiceConnection: VoiceConnection;
  public readonly audioPlayer: AudioPlayer;
  public queue: Track[];
  public queueLock = false;
  public readyLock = false;
  public current: Song | undefined = undefined;

  public constructor(voiceConnection: VoiceConnection) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];

    this.voiceConnection.on("stateChange", async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              5_000
            );
          } catch {
            this.voiceConnection.destroy();
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
   
          await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
          this.voiceConnection.rejoin();
        } else {
      
          this.voiceConnection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
      
        this.stop();
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
    
        this.readyLock = true;
        try {
          await entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Ready,
            20_000
          );
        } catch {
          if (
            this.voiceConnection.state.status !==
            VoiceConnectionStatus.Destroyed
          )
            this.voiceConnection.destroy();
        } finally {
          this.readyLock = false;
        }
      }
    });


    this.audioPlayer.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {

        (oldState.resource as AudioResource<Track>).metadata.onFinish();
        void this.processQueue();
      } else if (newState.status === AudioPlayerStatus.Playing) {

        (newState.resource as AudioResource<Track>).metadata.onStart();
      }
    });

    this.audioPlayer.on("error", (error) =>
      (error.resource as AudioResource<Track>).metadata.onError(error)
    );

    voiceConnection.subscribe(this.audioPlayer);
  }

  public enqueue(track: Track, first: boolean = false) {
    if (first) this.queue = [track].concat(this.queue);
    else this.queue.push(track);
    void this.processQueue();
  }

  public spotifyEnqueue = async (
    message: Message,
    subscription: JuanitaSubscription,
    songs: Song[]
  ) => {
    for (const song of songs) {
      const track = await Track.from(message, subscription, song);
      if (!track) continue;
      this.enqueue(track);
    }
  };

  public stop() {
    this.queueLock = true;
    this.queue = [];
    this.audioPlayer.stop(true);
  }


  private async processQueue(): Promise<void> {
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }

    this.queueLock = true;


    const nextTrack = this.queue.shift()!;
    try {

      const { title, requestor, isSpotify } = nextTrack.song;
      if (isSpotify) {
        const song = await YTSearcher.search(title, requestor);
        if (!song) throw new Error("Unable to find resource");
        nextTrack.song = song;
      }
      const resource = await nextTrack.createAudioResource();
      this.audioPlayer.play(resource);
      this.queueLock = false;
    } catch (error) {
      nextTrack.onError(error as Error);
      this.queueLock = false;
      return this.processQueue();
    }
  }

  time = (song: Song): number => {
    if (
      this.current &&
      this.audioPlayer.state.status == AudioPlayerStatus.Playing
    ) {
      return Math.floor(
        song.seconds - this.audioPlayer.state.playbackDuration / 1000
      );
    }
    return song.seconds;
  };

  bar = (): string => {
    let bar = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬".split("");
    let index: number = 0;
    if (
      this.current &&
      this.audioPlayer.state.status == AudioPlayerStatus.Playing
    ) {
      const part =
        this.audioPlayer.state.playbackDuration / 1000 / this.current.seconds;
      index = Math.ceil(part * bar.length);
    }
    if (Number.isNaN(index)) index = 0;
    bar[index] = "🔘";
    return bar.join("");
  };

  inrange = (index: number): boolean => {
    return index >= 0 && index < this.queue.length;
  };

  kill = (index: number): Song => {
    const song = { ...this.queue[index].song };
    this.queue.splice(index, 1);
    return song;
  };
  

  skipTo = (index: number): Song => {
    const track = { ...this.queue[index] };
    this.queue = this.queue.splice(index, this.queue.length);
    return track.song;
  };
}
