import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { config } from "../config.js";
import type { ChatMessage } from "./conversationCache.js";
import { TOOL_SCHEMAS, executeTool, type ToolContext, type ToolSchema } from "./tools.js";

const MAX_RESPONSE_TOKENS = 200;
const MAX_RESPONSE_TOKENS_WITH_TOOLS = 300;

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client)
    client = new OpenAI({
      apiKey: config.openai!.apiKey,
      baseURL: "https://api.openai.com/v1",
      maxRetries: 2,
      timeout: 15_000,
    });
  return client;
}

function toOpenAITools(schemas: ToolSchema[]): ChatCompletionTool[] {
  return schemas.map((s) => ({
    type: "function" as const,
    function: {
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters,
    },
  }));
}

export async function chatCompletion(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  fallbackMessage?: string,
  toolContext?: ToolContext,
): Promise<string> {
  if (!config.openai) {
    return fallbackMessage ?? "LLM is not configured.";
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userMessage },
  ];

  const tools = toolContext ? toOpenAITools(TOOL_SCHEMAS) : undefined;
  const maxTokens = toolContext ? MAX_RESPONSE_TOKENS_WITH_TOOLS : MAX_RESPONSE_TOKENS;

  try {
    const response = await getClient().chat.completions.create({
      model: config.openai.model,
      messages,
      max_tokens: maxTokens,
      tools,
    });

    const choice = response.choices[0]?.message;
    if (!choice) return fallbackMessage ?? "Error";

    // If no tool calls, return text directly
    if (!choice.tool_calls?.length) {
      return choice.content?.trim() ?? "...";
    }

    // Execute tool calls
    if (!toolContext) return choice.content?.trim() ?? "...";

    // Add assistant message with tool calls to conversation
    messages.push(choice);

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

    // Second API call — get final text response (no tools to prevent recursion)
    const finalResponse = await getClient().chat.completions.create({
      model: config.openai.model,
      messages,
      max_tokens: MAX_RESPONSE_TOKENS,
    });

    return finalResponse.choices[0]?.message?.content?.trim() ?? "...";
  } catch (error) {
    console.error("[LLM] OpenAI request failed:", error);
    return fallbackMessage ?? "Error";
  }
}
