# Phase 4 Design: Smart Curation & History Analysis

**Date:** 2026-03-01
**Scope:** /recommend, /stats, Auto-DJ, LLM recommend tool

## Features

### 1. `/recommend` — LLM-Powered Song Recommendations

**Trigger:** `/recommend` slash command

**Flow:**
1. Query guild's top 20 most-played songs from `history` table (grouped by title/url, ordered by play count)
2. Build a string like "This server's most played songs: 1. Bohemian Rhapsody (15 plays), 2. ..."
3. Send to LLM with system prompt asking for 3-5 new song recommendations based on this taste
4. Include tool context so the LLM can use `play_song` if user asks it to play a recommendation
5. Reply with the LLM's response

**Token cost:** ~800 tokens per call (history context + response)

### 2. `/stats` — Listening Statistics

**Trigger:** `/stats` slash command

**Flow:**
1. Query `history` table with aggregations:
   - Top 5 most played songs (COUNT grouped by title, url)
   - Top 5 most active requesters (COUNT grouped by requested_by_tag)
   - Total unique songs, total plays, total listening hours (SUM duration_seconds)
2. Build a rich embed with sections for each stat
3. Reply with embed

**Token cost:** Zero (pure SQL)

### 3. Auto-DJ — Keep Playing When Queue Empties

**Trigger:** `playerEmpty` event (currently destroys the player)

**Behavior:**
- When queue empties AND auto-dj is enabled for the guild, pick a random song from history and queue it
- Query: random row from `history` WHERE `guild_id = ?`, get the `url`
- Search via Kazagumo and queue the track
- If search fails or no history exists, disconnect as normal
- Keep going until someone manually disconnects (`/kys` or `btn:kys`)

**Toggle:**
- New `/autodj` command that toggles auto-dj on/off per guild
- New `auto_dj` boolean column on `guilds` table (default: false)
- i18n messages for toggle feedback

**Token cost:** Zero (pure database lookup)

### 4. LLM `recommend` Tool

Add a `recommend` tool to the existing tool schemas in `src/llm/tools.ts` so users can also trigger recommendations via @mention: "@Juanita recommend something for me".

The tool:
1. Queries the guild's top 20 songs from history
2. Returns the list as the tool result
3. The LLM uses this context to make recommendations in its response

## Database Changes

**Modify `guilds` table:** Add `auto_dj BOOLEAN DEFAULT false`

**New history queries in `historyRepo.ts`:**
- `getTopSongs(guildId, limit)` — top songs by play count
- `getTopRequesters(guildId, limit)` — top users by request count
- `getGuildStats(guildId)` — total plays, unique songs, total hours
- `getRandomSong(guildId)` — random song URL for auto-dj

## New Files

- `src/commands/recommend.ts` — /recommend slash command
- `src/commands/stats.ts` — /stats slash command
- `src/commands/autodj.ts` — /autodj toggle command
- `src/embeds/statsEmbed.ts` — stats embed builder

## Modified Files

- `src/db/schema.ts` — add `autoDj` column to guilds
- `src/db/repositories/historyRepo.ts` — add query functions
- `src/db/repositories/guildRepo.ts` — add `getAutoDj` / `toggleAutoDj`
- `src/llm/tools.ts` — add `recommend` tool schema + executor
- `src/index.ts` — modify `playerEmpty` handler for auto-dj
- `src/i18n/messages.ts` — new strings
- `src/music/guildState.ts` — add `autoDj` to GuildState
