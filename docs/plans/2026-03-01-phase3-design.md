# Phase 3 Design: @Mention Chat via OpenRouter

**Date:** 2026-03-01
**Scope:** LLM-powered @mention chat with Molde personality

## Goal

Users @mention Juanita in a text channel to have music-related conversations. The bot responds in character (matching the guild's language setting — en, no, or molde). Non-music topics are refused in character.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| LLM features | @mention chat only | Keep scope tight, add /recommend in Phase 4 |
| Model | GPT-4o-mini via OpenRouter | Cheapest option (~$0.15/M in, $0.60/M out) |
| Guardrails | System prompt only | Simple, effective — the prompt constrains to music topics |
| Context strategy | 3-message sliding window | Conversational feel without unbounded cost |
| Message cap | 500 characters | Prevents abuse (book uploads, long prompts) |
| Response cap | max_tokens: 200 | Keeps bot concise |

## Architecture

### New Files

- `src/llm/openrouter.ts` — OpenRouter API harness
- `src/llm/conversationCache.ts` — In-memory sliding window cache
- `src/llm/systemPrompts.ts` — Per-language system prompt builders
- `src/core/mentionHandler.ts` — messageCreate event handler for @mentions

### Data Flow

```
User: @Juanita what should I play?
  → messageCreate event
  → mentionHandler: bot mentioned? → yes
  → strip mention, truncate to 500 chars
  → conversationCache.get(guildId:userId) → last 3 exchanges
  → systemPrompts.build(lang) → system prompt
  → openrouter.chatCompletion(system, history, userMsg)
  → reply in channel
  → conversationCache.push(guildId:userId, userMsg, assistantMsg)
```

### OpenRouter Harness (`src/llm/openrouter.ts`)

Single function: `chatCompletion(messages, options)`.

- Calls `https://openrouter.ai/api/v1/chat/completions` (OpenAI-compatible)
- Sets `max_tokens: 200`
- Sets `model` from config (default: `openai/gpt-4o-mini`)
- Returns the assistant message string
- Error handling: on failure, returns a canned error response (no throw to user)

### Conversation Cache (`src/llm/conversationCache.ts`)

- `Map<string, { messages: Message[], lastActive: number }>`
- Key: `${guildId}:${userId}`
- Max 3 exchanges (6 messages: 3 user + 3 assistant)
- Entries expire after 5 minutes of inactivity
- Cleanup runs on a 60-second interval
- No persistence — purely in-memory

### System Prompts (`src/llm/systemPrompts.ts`)

Built dynamically per language. ~150 tokens each. Contains:
1. Bot identity and personality
2. Music-only constraint
3. Available commands reference
4. Response brevity instruction (2-3 sentences max)

### Mention Handler (`src/core/mentionHandler.ts`)

- Listens to `messageCreate`
- Filters: guild-only, bot mentioned, not from a bot
- Strips the @mention from message content
- Truncates to 500 characters
- Calls LLM harness
- Replies in the same channel
- Uses `message.channel.sendTyping()` while waiting for LLM response

## Token Budget

| Component | Tokens |
|---|---|
| System prompt | ~150 |
| Sliding window (3 exchanges) | ~300 |
| User message (500 char cap) | ~125 |
| **Total input** | **~575** |
| **max_tokens (output)** | **200** |
| **Max total per call** | **~775** |

### Cost Estimates (GPT-4o-mini)

| Usage | Daily Cost |
|---|---|
| 100 calls/day | ~$0.02 |
| 500 calls/day | ~$0.10 |
| 1000 calls/day | ~$0.20 |

## Config

New environment variables:
- `OPENROUTER_API_KEY` — required for @mention chat
- `OPENROUTER_MODEL` — optional, defaults to `openai/gpt-4o-mini`

## What This Does NOT Include

- No `/recommend` command (Phase 4)
- No proactive playback comments (Phase 4)
- No image/attachment processing (attachments ignored)
- No DM support (guild-only)
- No conversation persistence across restarts
