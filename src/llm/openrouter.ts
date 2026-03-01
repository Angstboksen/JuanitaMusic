import { config } from "../config.js";
import type { ChatMessage } from "./conversationCache.js";
import { TOOL_SCHEMAS, executeTool, type ToolContext, type ToolSchema } from "./tools.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RESPONSE_TOKENS = 200;
const MAX_RESPONSE_TOKENS_WITH_TOOLS = 300;

interface ApiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface ApiResponse {
  choices?: {
    message?: {
      content?: string | null;
      tool_calls?: ToolCall[];
    };
  }[];
}

async function callApi(messages: ApiMessage[], tools?: ToolSchema[], maxTokens?: number): Promise<ApiResponse | null> {
  if (!config.openrouter) return null;

  const body: Record<string, unknown> = {
    model: config.openrouter.model,
    messages,
    max_tokens: maxTokens ?? MAX_RESPONSE_TOKENS,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openrouter.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[LLM] OpenRouter error: ${response.status} ${response.statusText}`);
      return null;
    }

    return (await response.json()) as ApiResponse;
  } catch (error) {
    console.error("[LLM] OpenRouter request failed:", error);
    return null;
  }
}

export async function chatCompletion(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  fallbackMessage?: string,
  toolContext?: ToolContext,
): Promise<string> {
  if (!config.openrouter) {
    return fallbackMessage ?? "LLM is not configured.";
  }

  const messages: ApiMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userMessage },
  ];

  const tools = toolContext ? TOOL_SCHEMAS : undefined;
  const maxTokens = toolContext ? MAX_RESPONSE_TOKENS_WITH_TOOLS : MAX_RESPONSE_TOKENS;

  // First API call
  const data = await callApi(messages, tools, maxTokens);
  if (!data) return fallbackMessage ?? "Error";

  const choice = data.choices?.[0]?.message;
  if (!choice) return fallbackMessage ?? "Error";

  // If no tool calls, return text directly
  if (!choice.tool_calls?.length) {
    return choice.content?.trim() ?? "...";
  }

  // Execute tool calls
  if (!toolContext) return choice.content?.trim() ?? "...";

  // Add assistant message with tool calls to conversation
  messages.push({
    role: "assistant",
    content: choice.content ?? null,
    tool_calls: choice.tool_calls,
  });

  // Execute each tool and add results
  for (const toolCall of choice.tool_calls) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      // If args parsing fails, pass empty
    }

    const result = await executeTool(toolCall.function.name, args, toolContext);

    messages.push({
      role: "tool",
      content: result,
      tool_call_id: toolCall.id,
    });
  }

  // Second API call — get final text response (no tools this time to prevent recursion)
  const finalData = await callApi(messages, undefined, MAX_RESPONSE_TOKENS);
  if (!finalData) return fallbackMessage ?? "Error";

  return finalData.choices?.[0]?.message?.content?.trim() ?? "...";
}
