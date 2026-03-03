import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  type VoiceConnection,
  type AudioPlayer,
  type PlayerSubscription,
  StreamType,
} from "@discordjs/voice";
import { Readable } from "stream";

export class TtsPlayer {
  private player: AudioPlayer;
  private subscription: PlayerSubscription | null = null;
  private playing = false;

  constructor() {
    this.player = createAudioPlayer();
  }

  /**
   * Play a TTS audio buffer through the voice connection.
   * Music should already be paused by the caller before invoking this.
   */
  async speak(
    connection: VoiceConnection,
    audioBuffer: Buffer,
  ): Promise<void> {
    if (this.playing) return; // Don't overlap TTS
    this.playing = true;

    try {
      // Subscribe the TTS player to the connection
      this.subscription?.unsubscribe();
      this.subscription = connection.subscribe(this.player) ?? null;

      // Create audio resource from buffer
      const stream = Readable.from(audioBuffer);
      const resource = createAudioResource(stream, {
        inputType: StreamType.OggOpus,
      });

      // Play and wait for completion
      this.player.play(resource);

      await new Promise<void>((resolve) => {
        const onIdle = () => {
          this.player.removeListener(AudioPlayerStatus.Idle, onIdle);
          resolve();
        };
        this.player.on(AudioPlayerStatus.Idle, onIdle);

        // Safety timeout: 15 seconds max
        setTimeout(() => {
          this.player.removeListener(AudioPlayerStatus.Idle, onIdle);
          this.player.stop();
          resolve();
        }, 15_000);
      });
    } catch (error) {
      console.error("[TtsPlayer] Playback error:", error);
    } finally {
      // Clean up TTS subscription
      this.subscription?.unsubscribe();
      this.subscription = null;
      this.playing = false;
    }
  }

  get isPlaying(): boolean {
    return this.playing;
  }
}
