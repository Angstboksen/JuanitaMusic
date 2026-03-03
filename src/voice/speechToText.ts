import { SpeechClient } from "@google-cloud/speech";
import type { Language } from "../i18n/types.js";

const client = new SpeechClient();

const LANGUAGE_MAP: Record<Language, string> = {
  en: "en-US",
  no: "nb-NO", // Norwegian Bokmål
  molde: "nb-NO", // Closest match for Molde dialect
};

/**
 * Transcribe a PCM audio buffer to text using Google Cloud Speech-to-Text.
 * Audio must be 16kHz, 16-bit, mono, linear PCM.
 */
export async function transcribe(
  pcmBuffer: Buffer,
  lang: Language,
): Promise<string | null> {
  if (pcmBuffer.length === 0) return null;

  try {
    const [response] = await client.recognize({
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: LANGUAGE_MAP[lang],
        model: "latest_short", // Optimized for short commands
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: pcmBuffer.toString("base64"),
      },
    });

    const transcript = response.results
      ?.map((r) => r.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (transcript) {
      console.log(`[STT] Transcribed: "${transcript}"`);
    }

    return transcript || null;
  } catch (error) {
    console.error("[STT] Transcription failed:", error);
    return null;
  }
}
