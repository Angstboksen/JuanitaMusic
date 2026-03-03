import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import type { Language } from "../i18n/types.js";

const client = new TextToSpeechClient();

const VOICE_MAP: Record<Language, { languageCode: string; name: string }> = {
  en: { languageCode: "en-US", name: "en-US-Neural2-F" },
  no: { languageCode: "nb-NO", name: "nb-NO-Wavenet-A" },
  molde: { languageCode: "nb-NO", name: "nb-NO-Wavenet-A" },
};

/**
 * Synthesize text to Opus audio for Discord playback.
 * Returns an OGG/Opus buffer that @discordjs/voice can play directly.
 */
export async function synthesize(
  text: string,
  lang: Language,
): Promise<Buffer | null> {
  if (!text) return null;

  // Truncate long responses to keep TTS snappy
  const truncated = text.length > 300 ? text.slice(0, 297) + "..." : text;

  try {
    const voice = VOICE_MAP[lang];
    const [response] = await client.synthesizeSpeech({
      input: { text: truncated },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },
      audioConfig: {
        audioEncoding: "OGG_OPUS",
        sampleRateHertz: 48000, // Discord standard
        speakingRate: 1.1, // Slightly faster for assistant-like feel
      },
    });

    if (!response.audioContent) return null;

    console.log(`[TTS] Synthesized ${truncated.length} chars`);

    return Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent as Uint8Array);
  } catch (error) {
    console.error("[TTS] Synthesis failed:", error);
    return null;
  }
}
