# Phase 3: @Mention Chat via OpenRouter — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users @mention Juanita for music-related conversations with personality (en/no/molde), powered by GPT-4o-mini via OpenRouter, with strict token budgets.

**Architecture:** A new `src/llm/` module handles OpenRouter API calls, conversation caching, and system prompt generation. A `mentionHandler` in `src/core/` listens for @mentions on `messageCreate` and routes them through the LLM harness. All state is in-memory with TTL expiry.

**Tech Stack:** OpenRouter API (OpenAI-compatible), GPT-4o-mini, native `fetch`, Discord.js messageCreate event

---

### Task 1: Config — Add OpenRouter env vars

**Files:**
- Modify: `src/config.ts`
- Modify: `.env.example`

**Step 1: Add OpenRouter config to `src/config.ts`**

Add a new `openrouter` section to the `JuanitaConfig` interface and config object. The API key is **optional** (Phase 3 features just won't work without it). The model defaults to `openai/gpt-4o-mini`.

In `src/config.ts`, add to the `JuanitaConfig` interface after the `database` field:

```typescript
  openrouter?: {
    apiKey: string;
    model: string;
  };
```

And add to the `config` object after the `database` field:

```typescript
  openrouter: process.env.OPENROUTER_API_KEY
    ? {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      }
    : undefined,
```

**Step 2: Update `.env.example`**

Add after the Spotify section:

```
# OpenRouter (optional — needed for @mention chat)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/config.ts .env.example
git commit -m "feat: add OpenRouter config for LLM integration"
```

---

### Task 2: System Prompts — Per-language personality builders

**Files:**
- Create: `src/llm/systemPrompts.ts`

**Step 1: Create `src/llm/systemPrompts.ts`**

This file exports a function that builds a system prompt based on the guild's language. The prompt must:
1. Set the bot's identity and personality
2. Constrain to music topics only
3. Reference available commands
4. Enforce brevity (2-3 sentences max)

```typescript
import type { Language } from "../i18n/types.js";

const PROMPTS: Record<Language, string> = {
  en: `You are Juanita, a music bot for Discord. You have strong opinions about music and love recommending songs.
Rules:
- ONLY discuss music, artists, songs, albums, playlists, concerts, and music recommendations.
- If asked about anything else, refuse and steer back to music.
- Keep responses to 2-3 sentences max.
- Be friendly and enthusiastic about music.
- You can suggest users try commands: /play, /queue, /skip, /shuffle, /alias.`,

  no: `Du er Juanita, en musikkbot for Discord. Du har sterke meninger om musikk og elsker å anbefale sanger.
Regler:
- Snakk KUN om musikk, artister, sanger, album, spillelister, konserter og musikkanbefalinger.
- Hvis noen spør om noe annet, avvis og styr tilbake til musikk.
- Hold svarene til 2-3 setninger maks.
- Vær vennlig og entusiastisk om musikk.
- Du kan foreslå kommandoer: /play, /queue, /skip, /shuffle, /alias.`,

  molde: `DU E JUANITA, EN JÆVLA MUSIKKBOT FRA MOLDE! DU HAR STERKE MENINGA OM MUSIKK OG ELSKE Å ANBEFALE SANGA.
REGLA:
- SNAKK KUN OM MUSIKK, ARTISTA, SANGA, ALBUM, SPILLELISTA, KONSERTA OG MUSIKKANBEFALINGA.
- HVIS NÅKEN SPØR OM NOKKA ANNA, AVVIS DEM OG STYR TILBAKE TE MUSIKK. VÆR AGGRESSIV.
- HOLD SVARA TE 2-3 SETNINGER MAKS.
- SNAKK I MOLDEDIALEKT. BRUK CAPS. VÆR AGGRESSIV MEN HJELPSOM OM MUSIKK.
- DU KAN FORESLÅ KOMMANDOA: /play, /queue, /skip, /shuffle, /alias.`,
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
git commit -m "feat: per-language system prompts for LLM personality"
```

---

### Task 3: Conversation Cache — In-memory sliding window

**Files:**
- Create: `src/llm/conversationCache.ts`

**Step 1: Create `src/llm/conversationCache.ts`**

A simple in-memory cache that stores the last 3 exchanges (user + assistant) per guild:user pair. Entries expire after 5 minutes. A cleanup interval runs every 60 seconds.

```typescript
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CacheEntry {
  messages: ChatMessage[];
  lastActive: number;
}

const MAX_EXCHANGES = 3; // 3 user + 3 assistant = 6 messages
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

const cache = new Map<string, CacheEntry>();

function cacheKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

export function getHistory(guildId: string, userId: string): ChatMessage[] {
  const entry = cache.get(cacheKey(guildId, userId));
  if (!entry) return [];
  if (Date.now() - entry.lastActive > TTL_MS) {
    cache.delete(cacheKey(guildId, userId));
    return [];
  }
  return entry.messages;
}

export function pushExchange(guildId: string, userId: string, userMsg: string, assistantMsg: string): void {
  const key = cacheKey(guildId, userId);
  const entry = cache.get(key) ?? { messages: [], lastActive: 0 };

  entry.messages.push(
    { role: "user", content: userMsg },
    { role: "assistant", content: assistantMsg },
  );

  // Keep only last N exchanges (2 messages per exchange)
  while (entry.messages.length > MAX_EXCHANGES * 2) {
    entry.messages.shift();
    entry.messages.shift();
  }

  entry.lastActive = Date.now();
  cache.set(key, entry);
}

// Cleanup expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.lastActive > TTL_MS) {
      cache.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/conversationCache.ts
git commit -m "feat: in-memory conversation cache with sliding window"
```

---

### Task 4: OpenRouter Harness — API call wrapper

**Files:**
- Create: `src/llm/openrouter.ts`

**Step 1: Create `src/llm/openrouter.ts`**

A single `chatCompletion` function that calls OpenRouter's OpenAI-compatible endpoint. Uses native `fetch` (Node 18+). Handles errors gracefully — returns a fallback string on failure, never throws.

```typescript
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
): Promise<string> {
  if (!config.openrouter) {
    return "LLM is not configured.";
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
      return "I'm having trouble thinking right now, try again later!";
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return data.choices?.[0]?.message?.content?.trim() ?? "...";
  } catch (error) {
    console.error("[LLM] OpenRouter request failed:", error);
    return "I'm having trouble thinking right now, try again later!";
  }
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/openrouter.ts
git commit -m "feat: OpenRouter API harness with token limits"
```

---

### Task 5: Mention Handler — Wire @mention to LLM

**Files:**
- Create: `src/core/mentionHandler.ts`
- Modify: `src/index.ts`

**Step 1: Create `src/core/mentionHandler.ts`**

Listens for `messageCreate`. Fires only when the bot is @mentioned in a guild. Strips the mention, truncates to 500 chars, calls the LLM, and replies.

```typescript
import type { Message } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { config } from "../config.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { buildSystemPrompt } from "../llm/systemPrompts.js";
import { getHistory, pushExchange } from "../llm/conversationCache.js";
import { chatCompletion } from "../llm/openrouter.js";

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
    await message.channel.sendTyping();

    const systemPrompt = buildSystemPrompt(state.lang);
    const history = getHistory(message.guild.id, message.author.id);
    const response = await chatCompletion(systemPrompt, history, truncated);

    // Cache the exchange for conversation continuity
    pushExchange(message.guild.id, message.author.id, truncated, response);

    await message.reply(response);
  });
}
```

**Step 2: Wire it up in `src/index.ts`**

Add this import at the top of `src/index.ts` (after the existing imports):

```typescript
import { setupMentionHandler } from "./core/mentionHandler.js";
```

Add this call after the existing `setupInteractionHandler(client);` line:

```typescript
setupMentionHandler(client);
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/core/mentionHandler.ts src/index.ts
git commit -m "feat: @mention handler wired to LLM for music chat"
```

---

### Task 6: i18n — LLM error/fallback messages

**Files:**
- Modify: `src/i18n/messages.ts`

**Step 1: Add LLM-related i18n strings**

Add to the end of `src/i18n/messages.ts`:

```typescript
// === LLM messages ===

export const LLM_NOT_CONFIGURED: LocalizedString = {
  en: "LLM features are not configured on this bot.",
  no: "LLM-funksjoner er ikke konfigurert på denne boten.",
  molde: "LLM-GREIENE E IKKJE SATT OPP PÅ DENNA BOTEN!",
};

export const LLM_ERROR: LocalizedString = {
  en: "I'm having trouble thinking right now, try again later!",
  no: "Jeg har litt problemer med å tenke akkurat nå, prøv igjen senere!",
  molde: "FAEN I HÆLVETTE, HJERNEN MIN FUNKE IKKJE NO! PRØV IGJEN SEINERE!",
};
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/i18n/messages.ts
git commit -m "feat: LLM i18n strings for en/no/molde"
```

---

### Task 7: Update mentionHandler to use i18n error messages

**Files:**
- Modify: `src/core/mentionHandler.ts`
- Modify: `src/llm/openrouter.ts`

**Step 1: Update openrouter.ts to accept a language-aware fallback**

Change `chatCompletion` to accept an optional `fallbackMessage` parameter so the caller can pass a localized error string. Update the function signature:

```typescript
export async function chatCompletion(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  fallbackMessage?: string,
): Promise<string> {
```

Replace both error return strings (`"I'm having trouble thinking right now, try again later!"`) with:

```typescript
return fallbackMessage ?? "Error";
```

Also replace the unconfigured check:

```typescript
if (!config.openrouter) {
  return fallbackMessage ?? "LLM is not configured.";
}
```

**Step 2: Update mentionHandler.ts to pass localized fallback**

Import the LLM_ERROR message:

```typescript
import * as msg from "../i18n/messages.js";
```

Update the chatCompletion call to pass the localized fallback:

```typescript
const response = await chatCompletion(systemPrompt, history, truncated, msg.LLM_ERROR[state.lang]);
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/core/mentionHandler.ts src/llm/openrouter.ts
git commit -m "feat: localized LLM error messages"
```

---

### Task 8: Type check & smoke test

**Files:** None (verification only)

**Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Verify file structure**

The `src/llm/` directory should contain:
- `openrouter.ts`
- `conversationCache.ts`
- `systemPrompts.ts`

The `src/core/` directory should now contain:
- `commandRegistry.ts`
- `interactionRouter.ts`
- `mentionHandler.ts`

**Step 3: Verify env example has all vars**

`.env.example` should include `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.

Done! Phase 3 is complete. The bot now responds to @mentions with music-related chat in the guild's language.
