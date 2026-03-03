import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  type VoiceConnection,
  type AudioPlayer,
  StreamType,
} from "@discordjs/voice";
import { Readable } from "stream";
import type { KazagumoPlayer } from "kazagumo";

const DUCKED_VOLUME = 15; // Volume during TTS (out of 100)
const FADE_STEPS = 5;
const FADE_INTERVAL_MS = 40; // ~200ms total fade

export class TtsPlayer {
  private player: AudioPlayer;
  private playing = false;

  constructor() {
    this.player = createAudioPlayer();
  }

  /**
   * Play a TTS audio buffer through the voice connection.
   * Ducks the music player volume while speaking, then restores it.
   */
  async speak(
    connection: VoiceConnection,
    audioBuffer: Buffer,
    musicPlayer?: KazagumoPlayer,
  ): Promise<void> {
    if (this.playing) return; // Don't overlap TTS
    this.playing = true;

    const originalVolume = musicPlayer ? musicPlayer.volume : 50;

    try {
      // Subscribe the connection to our TTS player
      connection.subscribe(this.player);

      // Fade music volume down
      if (musicPlayer) {
        await this.fadeVolume(musicPlayer, originalVolume, DUCKED_VOLUME);
      }

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

      // Fade music volume back up
      if (musicPlayer) {
        await this.fadeVolume(musicPlayer, DUCKED_VOLUME, originalVolume);
      }
    } catch (error) {
      console.error("[TtsPlayer] Playback error:", error);
      // Restore volume on error
      if (musicPlayer) {
        await musicPlayer.setVolume(originalVolume);
      }
    } finally {
      this.playing = false;
    }
  }

  private async fadeVolume(
    player: KazagumoPlayer,
    from: number,
    to: number,
  ): Promise<void> {
    const step = (to - from) / FADE_STEPS;
    for (let i = 1; i <= FADE_STEPS; i++) {
      const volume = Math.round(from + step * i);
      await player.setVolume(volume);
      await new Promise((r) => setTimeout(r, FADE_INTERVAL_MS));
    }
  }

  get isPlaying(): boolean {
    return this.playing;
  }
}
