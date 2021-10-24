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
          /*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              5_000
            );
            // Probably moved voice channel
          } catch {
            this.voiceConnection.destroy();
            // Probably removed from voice channel
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          /*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
          await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
          this.voiceConnection.rejoin();
        } else {
          /*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
          this.voiceConnection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        /*
					Once destroyed, stop the subscription
				*/
        this.stop();
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
        /*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
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

    // Configure audio player
    this.audioPlayer.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
        // The queue is then processed to start playing the next track, if one is available.
        (oldState.resource as AudioResource<Track>).metadata.onFinish();
        void this.processQueue();
      } else if (newState.status === AudioPlayerStatus.Playing) {
        // If the Playing state has been entered, then a new track has started playback.
        (newState.resource as AudioResource<Track>).metadata.onStart();
      }
    });

    this.audioPlayer.on("error", (error) =>
      (error.resource as AudioResource<Track>).metadata.onError(error)
    );

    voiceConnection.subscribe(this.audioPlayer);
  }

  /**
   * Adds a new Track to the queue.
   *
   * @param track The track to add to the queue
   * @param first Whether or not to prioritize the track
   */
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

  /**
   * Stops audio playback and empties the queue
   */
  public stop() {
    this.queueLock = true;
    this.queue = [];
    this.audioPlayer.stop(true);
  }

  /**
   * Attempts to play a Track from the queue
   */
  private async processQueue(): Promise<void> {
    // If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }
    // Lock the queue to guarantee safe access
    this.queueLock = true;

    // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
    const nextTrack = this.queue.shift()!;
    try {
      // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
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
      // If an error occurred, try the next item of the queue instead
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
