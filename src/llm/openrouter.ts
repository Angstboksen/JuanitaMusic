import { config } from "../config.js";
import type { ChatMessage } from "./conversationCache.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RESPONSE_TOKENS = 200;

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  fallbackMessage?: string,
): Promise<string> {
  if (!config.openrouter) {
    return fallbackMessage ?? "LLM is not configured.";
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openrouter.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openrouter.model,
        messages,
        max_tokens: MAX_RESPONSE_TOKENS,
      }),
    });

    if (!response.ok) {
      console.error(`[LLM] OpenRouter error: ${response.status} ${response.statusText}`);
      return fallbackMessage ?? "Error";
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return data.choices?.[0]?.message?.content?.trim() ?? "...";
  } catch (error) {
    console.error("[LLM] OpenRouter request failed:", error);
    return fallbackMessage ?? "Error";
  }
}
