import OpenAI, { toFile } from "openai";
import { config } from "../config.js";
import type { Language } from "../i18n/types.js";

const openai = new OpenAI({ apiKey: config.voice?.openaiApiKey });

const LANGUAGE_MAP: Record<Language, string> = {
  en: "en",
  no: "no",
  molde: "no",
};

/**
 * Wrap raw PCM (16kHz, 16-bit, mono) in a minimal WAV header
 * so the Whisper API can accept it as a file upload.
 */
function pcmToWav(pcm: Buffer): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  const fileSize = 36 + dataSize;

  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(16000, 24); // sample rate
  header.writeUInt32LE(32000, 28); // byte rate (16000 * 2)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcm]);
}

/**
 * Transcribe a PCM audio buffer to text using OpenAI Whisper.
 * Audio must be 16kHz, 16-bit, mono, linear PCM.
 */
export async function transcribe(
  pcmBuffer: Buffer,
  lang: Language,
): Promise<string | null> {
  if (pcmBuffer.length === 0) return null;

  try {
    const wav = pcmToWav(pcmBuffer);
    const file = await toFile(wav, "audio.wav", { type: "audio/wav" });

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      language: LANGUAGE_MAP[lang],
    });

    const transcript = response.text?.trim();

    if (transcript) {
      console.log(`[STT] Transcribed: "${transcript}"`);
    }

    return transcript || null;
  } catch (error) {
    console.error("[STT] Transcription failed:", error);
    return null;
  }
}
