# LLM Tool Calling for Music Control — Design

**Date:** 2026-03-01
**Scope:** Extend Phase 3 @mention chat so the LLM can execute music actions via function calling

## Goal

Users @mention Juanita with natural language like "play some Queen and shuffle the queue" and the bot actually does it — searches, queues, shuffles — then replies in character confirming what it did.

## Approach

Use OpenAI-compatible **function calling** (`tools` parameter). The LLM receives tool schemas describing available music actions. When the user's message implies an action, the LLM returns `tool_calls`. We execute each tool, feed results back, and the LLM generates a final text response.

## Tools

| Tool | Parameters | Description |
|---|---|---|
| `play_song` | `query: string` | Search and queue a song or playlist |
| `skip` | none | Skip to next track |
| `pause` | none | Toggle pause/resume |
| `shuffle` | none | Shuffle the queue |
| `clear_queue` | none | Clear all tracks from queue |
| `disconnect` | none | Disconnect from voice channel |
| `jump_to` | `position: number` | Jump to a specific queue position |
| `seek` | `seconds: number` | Seek to a time in the current track |

## Data Flow

```
User: "@Juanita play some Queen and shuffle the queue"
  → messageCreate → mentionHandler
  → strip mention, truncate to 500 chars
  → chatCompletion(system, history, userMsg, tools)
  → LLM response includes tool_calls:
      [play_song({query: "Queen"}), shuffle({})]
  → execute each tool via executeTool()
      → play_song: kazagumo.search("Queen") → queue first track
      → shuffle: player.queue.shuffle()
  → send tool results back to LLM
  → LLM generates final text: "Satt på Queen og shuffla køa!"
  → message.reply(text)
```

## Architecture

### New file: `src/llm/tools.ts`

1. `TOOL_SCHEMAS` — array of OpenAI tool definitions for the 8 music actions
2. `executeTool(name, args, context)` — executes a music action given tool name, parsed args, and context (guildId, userId, voiceChannelId, client, textChannel)

### Modified: `src/llm/openrouter.ts`

The `chatCompletion` function gains:
- `tools` parameter in the API request body
- A tool execution loop: if LLM returns `tool_calls`, execute them, append results, call API again for final text
- Max 1 round of tool calls (no recursive tool calling to prevent runaway costs)

### Modified: `src/core/mentionHandler.ts`

Passes additional context to `chatCompletion`:
- `guildId`, `userId` (already available)
- `voiceChannelId` (from message.member.voice.channel)
- `client` reference (for Kazagumo access)
- `textChannel` (for queue embed updates)

### Voice channel handling

Tool execution checks if the user is in voice. If not:
- `play_song`, `skip`, `pause`, `shuffle`, `clear_queue`, `disconnect`, `jump_to`, `seek` all return an error string like "User is not in a voice channel"
- The LLM relays this to the user in character

## Token Budget

| Component | Tokens |
|---|---|
| System prompt | ~150 |
| Tool schemas (8 tools) | ~300 |
| Sliding window (3 exchanges) | ~300 |
| User message (500 char cap) | ~125 |
| **Total input** | **~875** |
| **max_tokens (output)** | **300** |
| **Max total per call** | **~1175** |

With tool call round-trip (if tools invoked): ~1500 tokens total.

### Cost at GPT-4o-mini rates

| Usage | Daily Cost |
|---|---|
| 100 calls/day | ~$0.03 |
| 500 calls/day | ~$0.15 |
| 1000 calls/day | ~$0.30 |
