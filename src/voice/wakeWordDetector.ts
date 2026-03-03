import {
  Porcupine,
  BuiltinKeyword,
  getBuiltinKeywordPath,
} from "@picovoice/porcupine-node";
import { config } from "../config.js";

export class WakeWordDetector {
  private porcupine: Porcupine | null = null;
  private frameLength: number = 512;

  async initialize(): Promise<boolean> {
    if (!config.voice?.picovoiceAccessKey) {
      console.log("[WakeWord] No Picovoice access key configured, skipping");
      return false;
    }

    try {
      // Use built-in "Jarvis" keyword as a placeholder until custom "Juanita" is trained.
      // Custom keywords can be created at https://console.picovoice.ai/
      // The constructor expects file paths, so we resolve the built-in keyword to its .ppn path.
      const keywordPath = getBuiltinKeywordPath(BuiltinKeyword.JARVIS);

      this.porcupine = new Porcupine(
        config.voice.picovoiceAccessKey,
        [keywordPath], // Replace with custom "Juanita" .ppn file path later
        [0.6], // Sensitivity (0-1, higher = more sensitive but more false positives)
      );
      this.frameLength = this.porcupine.frameLength;
      console.log(
        `[WakeWord] Initialized (frame length: ${this.frameLength}, sample rate: ${this.porcupine.sampleRate})`,
      );
      return true;
    } catch (error) {
      console.error("[WakeWord] Failed to initialize:", error);
      return false;
    }
  }

  /**
   * Process a PCM audio buffer and check for wake word.
   * Audio must be 16kHz, 16-bit, mono.
   * Returns true if wake word was detected.
   */
  detect(pcmBuffer: Buffer): boolean {
    if (!this.porcupine) return false;

    // Convert Buffer to Int16Array
    const samples = new Int16Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.byteLength / 2,
    );

    // Process in frames
    for (
      let i = 0;
      i + this.frameLength <= samples.length;
      i += this.frameLength
    ) {
      const frame = samples.slice(i, i + this.frameLength);
      const keywordIndex = this.porcupine.process(frame);
      if (keywordIndex >= 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Given a full PCM buffer, find where the wake word occurs
   * and return the audio AFTER the wake word.
   */
  extractCommandAudio(pcmBuffer: Buffer): Buffer | null {
    if (!this.porcupine) return null;

    const samples = new Int16Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.byteLength / 2,
    );

    for (
      let i = 0;
      i + this.frameLength <= samples.length;
      i += this.frameLength
    ) {
      const frame = samples.slice(i, i + this.frameLength);
      const keywordIndex = this.porcupine.process(frame);
      if (keywordIndex >= 0) {
        // Return audio after the wake word frame
        const afterWakeWord = i + this.frameLength;
        if (afterWakeWord < samples.length) {
          const commandSamples = samples.slice(afterWakeWord);
          return Buffer.from(
            commandSamples.buffer,
            commandSamples.byteOffset,
            commandSamples.byteLength,
          );
        }
        return null; // Wake word at very end, no command audio
      }
    }

    return null; // No wake word detected
  }

  destroy(): void {
    if (this.porcupine) {
      this.porcupine.release();
      this.porcupine = null;
    }
  }
}
