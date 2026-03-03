import {
  Porcupine,
  BuiltinKeyword,
  getBuiltinKeywordPath,
} from "@picovoice/porcupine-node";
import { config } from "../config.js";
import { existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getKeywordPath(): { path: string; name: string } {
  const platform = process.platform === "darwin" ? "mac" : "linux";
  const keywordsDir = resolve(__dirname, "keywords");

  if (existsSync(keywordsDir)) {
    const files = readdirSync(keywordsDir);
    const match = files.find((f) => f.startsWith(`juanita_en_${platform}`) && f.endsWith(".ppn"));
    if (match) {
      return { path: resolve(keywordsDir, match), name: "Juanita" };
    }
  }

  // Fallback to built-in Jarvis
  console.log(`[WakeWord] No custom Juanita keyword found for ${platform}, falling back to Jarvis`);
  return { path: getBuiltinKeywordPath(BuiltinKeyword.JARVIS), name: "Jarvis" };
}

export class WakeWordDetector {
  private porcupine: Porcupine | null = null;
  private frameLength: number = 512;

  async initialize(): Promise<boolean> {
    if (!config.voice?.picovoiceAccessKey) {
      console.log("[WakeWord] No Picovoice access key configured, skipping");
      return false;
    }

    try {
      const keyword = getKeywordPath();

      this.porcupine = new Porcupine(
        config.voice.picovoiceAccessKey,
        [keyword.path],
        [0.6], // Sensitivity (0-1, higher = more sensitive but more false positives)
      );
      this.frameLength = this.porcupine.frameLength;
      console.log(
        `[WakeWord] Initialized with "${keyword.name}" (frame length: ${this.frameLength}, sample rate: ${this.porcupine.sampleRate})`,
      );
      return true;
    } catch (error) {
      console.error("[WakeWord] Failed to initialize:", error);
      return false;
    }
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
