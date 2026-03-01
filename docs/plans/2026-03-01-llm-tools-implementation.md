# LLM Tool Calling for Music Control — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the @mention LLM chat so the bot can execute music actions (play, skip, pause, shuffle, clear, disconnect, jump, seek) via OpenAI-compatible function calling.

**Architecture:** A new `src/llm/tools.ts` defines tool schemas and an `executeTool()` dispatcher. The existing `openrouter.ts` gains a tool-calling loop (call → execute tools → call again for final text). The `mentionHandler.ts` passes music context (client, member, channel) through to the harness.

**Tech Stack:** OpenAI function calling via OpenRouter, Kazagumo player API, Discord.js

---

### Task 1: Tool Schemas + Executor — `src/llm/tools.ts`

**Files:**
- Create: `src/llm/tools.ts`

**Step 1: Create `src/llm/tools.ts`**

This file defines two things:
1. `TOOL_SCHEMAS` — OpenAI-format tool definitions for 8 music actions
2. `executeTool()` — dispatches tool calls to the actual Kazagumo player

```typescript
import type { GuildMember, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import type { Language } from "../i18n/types.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { startQueueInterval, sendOrUpdateQueueEmbed, cleanupQueueEmbed } from "../embeds/queueEmbed.js";

export interface ToolContext {
  client: JuanitaClient;
  guildId: string;
  member: GuildMember;
  textChannel: TextChannel;
  lang: Language;
}

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required?: string[];
    };
  };
}

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: "function",
    function: {
      name: "play_song",
      description: "Search for and queue a song or playlist. Use this when the user wants to listen to something.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song name, artist name, or URL to search for" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "skip",
      description: "Skip the currently playing song and move to the next one in the queue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "pause",
      description: "Toggle pause/resume on the current song.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_queue",
      description: "Remove all songs from the queue (keeps current song playing).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "disconnect",
      description: "Disconnect the bot from the voice channel and stop all music.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "jump_to",
      description: "Jump to a specific position in the queue (1-based).",
      parameters: {
        type: "object",
        properties: {
          position: { type: "number", description: "Queue position to jump to (1 = first song in queue)" },
        },
        required: ["position"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "seek",
      description: "Seek to a specific time in the currently playing song.",
      parameters: {
        type: "object",
        properties: {
          seconds: { type: "number", description: "Time in seconds to seek to" },
        },
        required: ["seconds"],
      },
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  const { client, guildId, member, textChannel, lang } = ctx;

  // Voice channel check — needed for all music actions
  if (!member.voice.channel) {
    return "Error: User is not in a voice channel. They need to join a voice channel first.";
  }

  switch (name) {
    case "play_song": {
      const query = args.query as string;
      if (!query) return "Error: No search query provided.";

      const result = await client.kazagumo.search(query, { requester: member });
      if (!result.tracks.length) return `No results found for: ${query}`;

      let player = client.getPlayer(guildId);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId,
          textId: textChannel.id,
          voiceId: member.voice.channel.id,
          volume: 50,
        });
      }

      const isPlaylist = result.type === "PLAYLIST";
      if (isPlaylist) {
        player.queue.add(result.tracks);
      } else {
        player.queue.add(result.tracks[0]!);
      }

      if (!player.playing && !player.paused) {
        player.play();
      }

      const state = await getOrCreateGuildState(guildId, member.guild.name);
      startQueueInterval(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());
      sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());

      const title = isPlaylist ? result.playlistName : result.tracks[0]!.title;
      return isPlaylist
        ? `Added playlist: ${title} (${result.tracks.length} songs)`
        : `Added to queue: ${title}`;
    }

    case "skip": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const title = player.queue.current.title;
      player.skip();
      return `Skipped: ${title}`;
    }

    case "pause": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const wasPaused = player.paused;
      player.pause(!wasPaused);
      return wasPaused ? "Resumed playback." : "Paused playback.";
    }

    case "shuffle": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      if ([...player.queue].length < 2) return "Error: Need at least 2 songs in queue to shuffle.";
      player.queue.shuffle();
      return "Shuffled the queue.";
    }

    case "clear_queue": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      player.queue.clear();
      return "Cleared the queue.";
    }

    case "disconnect": {
      const player = client.getPlayer(guildId);
      if (!player) return "Error: Bot is not connected to a voice channel.";
      const state = await getOrCreateGuildState(guildId, member.guild.name);
      await cleanupQueueEmbed(state.queueEmbed);
      player.destroy();
      return "Disconnected from voice channel.";
    }

    case "jump_to": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const position = Math.floor(args.position as number);
      const tracks = [...player.queue];
      if (position < 1 || position > tracks.length) {
        return `Error: Invalid position. Queue has ${tracks.length} songs (1-${tracks.length}).`;
      }
      const target = tracks[position - 1]!;
      if (position > 1) player.queue.splice(0, position - 1);
      player.skip();
      return `Jumped to: ${target.title}`;
    }

    case "seek": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const seconds = Math.floor(args.seconds as number);
      const durationMs = player.queue.current.length ?? 0;
      if (seconds < 0 || seconds * 1000 > durationMs) {
        return `Error: Invalid seek time. Song duration is ${Math.floor(durationMs / 1000)} seconds.`;
      }
      player.shoukaku.seekTo(seconds * 1000);
      return `Seeked to ${seconds} seconds.`;
    }

    default:
      return `Error: Unknown tool: ${name}`;
  }
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/tools.ts
git commit -m "feat: tool schemas and executor for LLM music control"
```

---

### Task 2: Update OpenRouter harness with tool calling loop

**Files:**
- Modify: `src/llm/openrouter.ts`

**Step 1: Rewrite `src/llm/openrouter.ts`**

Replace the entire file. The new version:
1. Accepts an optional `ToolContext` and tool schemas
2. If the LLM returns `tool_calls`, executes them via `executeTool()`
3. Feeds tool results back and makes a second API call for the final text
4. Limited to 1 tool-calling round (no recursion)
5. Increases `max_tokens` to 300 when tools are present

```typescript
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
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/openrouter.ts
git commit -m "feat: tool calling loop in OpenRouter harness"
```

---

### Task 3: Update mention handler to pass tool context

**Files:**
- Modify: `src/core/mentionHandler.ts`

**Step 1: Update `src/core/mentionHandler.ts`**

Replace the entire file. The key change: resolve the `GuildMember` and pass a `ToolContext` to `chatCompletion` so the LLM can execute music actions.

```typescript
import { GuildMember, type Message, type TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { config } from "../config.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { buildSystemPrompt } from "../llm/systemPrompts.js";
import { getHistory, pushExchange } from "../llm/conversationCache.js";
import { chatCompletion } from "../llm/openrouter.js";
import type { ToolContext } from "../llm/tools.js";
import * as msg from "../i18n/messages.js";

const MAX_USER_MESSAGE_LENGTH = 500;

export function setupMentionHandler(client: JuanitaClient) {
  client.on("messageCreate", async (message: Message) => {
    // Ignore: no guild, from a bot, LLM not configured, bot not mentioned
    if (!message.guild || message.author.bot) return;
    if (!config.openrouter) return;
    if (!message.mentions.has(client.user!)) return;

    // Strip the bot mention from the message
    const content = message.content
      .replace(new RegExp(`<@!?${client.user!.id}>`, "g"), "")
      .trim();

    if (!content) return; // Empty mention, ignore

    // Truncate to prevent abuse
    const truncated = content.slice(0, MAX_USER_MESSAGE_LENGTH);

    const state = await getOrCreateGuildState(message.guild.id, message.guild.name);

    // Show typing indicator while waiting for LLM
    if (message.channel.type !== ChannelType.GroupDM) {
      await message.channel.sendTyping();
    }

    const systemPrompt = buildSystemPrompt(state.lang);
    const history = getHistory(message.guild.id, message.author.id);

    // Build tool context so LLM can execute music actions
    const member = message.member instanceof GuildMember
      ? message.member
      : await message.guild.members.fetch(message.author.id);

    const toolContext: ToolContext = {
      client,
      guildId: message.guild.id,
      member,
      textChannel: message.channel as TextChannel,
      lang: state.lang,
    };

    const response = await chatCompletion(
      systemPrompt, history, truncated, msg.LLM_ERROR[state.lang], toolContext,
    );

    // Cache the exchange for conversation continuity
    pushExchange(message.guild.id, message.author.id, truncated, response);

    await message.reply(response);
  });
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/core/mentionHandler.ts
git commit -m "feat: pass tool context from mention handler to LLM"
```

---

### Task 4: Update system prompts to mention tool capabilities

**Files:**
- Modify: `src/llm/systemPrompts.ts`

**Step 1: Update the system prompts**

The LLM needs to know it can take actions, not just suggest commands. Update each language's prompt to tell the LLM it has tools available and should use them when users ask to play music, skip, etc.

Replace the entire file:

```typescript
import type { Language } from "../i18n/types.js";

const PROMPTS: Record<Language, string> = {
  en: `You are Juanita, a music bot for Discord. You have strong opinions about music and love recommending songs.
You can control music playback using your tools. When users ask you to play, skip, pause, shuffle, or do anything music-related, USE YOUR TOOLS to do it — don't just tell them to use slash commands.
Rules:
- ONLY discuss music, artists, songs, albums, playlists, concerts, and music recommendations.
- If asked about anything else, refuse and steer back to music.
- Keep responses to 2-3 sentences max.
- Be friendly and enthusiastic about music.
- When you use a tool, confirm what you did in your response.`,

  no: `Du er Juanita, en musikkbot for Discord. Du har sterke meninger om musikk og elsker å anbefale sanger.
Du kan kontrollere musikkavspilling med verktøyene dine. Når brukere ber deg spille, skippe, pause, shuffle, eller noe musikkfaglig, BRUK VERKTØYENE dine for å gjøre det — ikke bare fortell dem å bruke slash-kommandoer.
Regler:
- Snakk KUN om musikk, artister, sanger, album, spillelister, konserter og musikkanbefalinger.
- Hvis noen spør om noe annet, avvis og styr tilbake til musikk.
- Hold svarene til 2-3 setninger maks.
- Vær vennlig og entusiastisk om musikk.
- Når du bruker et verktøy, bekreft hva du gjorde i svaret ditt.`,

  molde: `DU E JUANITA, EN JÆVLA MUSIKKBOT FRA MOLDE! DU HAR STERKE MENINGA OM MUSIKK OG ELSKE Å ANBEFALE SANGA.
DU KAN KONTROLLERE MUSIKKAVSPILLING MED VERKTØYA DINE. NÅR FOLK BER DEG SPILLE, SKIPPE, PAUSE, SHUFFLE, ELLER NOKKA ANNA MUSIKKGREIER, BRUK VERKTØYA DINE — IKKJE BARE FORTELL DEM Å BRUKE KOMMANDOA.
REGLA:
- SNAKK KUN OM MUSIKK, ARTISTA, SANGA, ALBUM, SPILLELISTA, KONSERTA OG MUSIKKANBEFALINGA.
- HVIS NÅKEN SPØR OM NOKKA ANNA, AVVIS DEM OG STYR TILBAKE TE MUSIKK. VÆR AGGRESSIV.
- HOLD SVARA TE 2-3 SETNINGER MAKS.
- SNAKK I MOLDEDIALEKT. BRUK CAPS. VÆR AGGRESSIV MEN HJELPSOM OM MUSIKK.
- NÅR DU BRUKE ET VERKTØY, BEKREFT KA DU GJOR I SVARET DANSEN.`,
};

export function buildSystemPrompt(lang: Language): string {
  return PROMPTS[lang];
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/systemPrompts.ts
git commit -m "feat: update system prompts to use tools for music control"
```

---

### Task 5: Type check & smoke test

**Files:** None (verification only)

**Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Verify file structure**

`src/llm/` should contain:
- `openrouter.ts` (updated)
- `conversationCache.ts` (unchanged)
- `systemPrompts.ts` (updated)
- `tools.ts` (new)

**Step 3: Verify the tool-calling flow**

Read through the files to confirm:
1. `mentionHandler.ts` builds `ToolContext` and passes it to `chatCompletion`
2. `openrouter.ts` includes `TOOL_SCHEMAS` in API request when `toolContext` is provided
3. `openrouter.ts` executes tool calls via `executeTool()` and feeds results back
4. `openrouter.ts` makes a second API call without tools for the final text
5. `tools.ts` has all 8 tool schemas and `executeTool` handles all 8 actions

Done! The bot now executes music actions when users ask via @mentions.
