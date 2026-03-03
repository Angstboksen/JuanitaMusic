import OpenAI from "openai";
import { config } from "../config.js";
import type { Language } from "../i18n/types.js";

let openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: config.openai!.apiKey });
  return openai;
}

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
    const response = await getClient().audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: truncated,
      response_format: "opus",
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[TTS] Synthesized ${truncated.length} chars`);

    return buffer;
  } catch (error) {
    console.error("[TTS] Synthesis failed:", error);
    return null;
  }
}
