# Phase 2: Spotify Integration + Alias System

**Date:** 2026-03-01
**Author:** Hauk Aleksander Olaussen + Claude

## Goal

Add Spotify URL support to `/play` (tracks, playlists, albums) via the LavaSrc Lavalink plugin, and implement a per-guild alias system so users can save and recall any playlist URL by name.

## Spotify Integration

LavaSrc is a Lavalink plugin that intercepts Spotify URLs, fetches track metadata from Spotify's API, then resolves each track to a YouTube match. This happens entirely server-side in Lavalink — no changes needed in the bot's `/play` command since Kazagumo already handles search results uniformly regardless of source.

**Requirements:**
- Spotify app credentials (Client ID + Secret from developer.spotify.com)
- New env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- LavaSrc plugin added to `lavalink/application.yml`

**What works automatically after setup:**
- `/play https://open.spotify.com/track/...`
- `/play https://open.spotify.com/playlist/...`
- `/play https://open.spotify.com/album/...`

## Alias System

### Commands

- `/alias save <name> <url>` — Store a URL under a name for this server
- `/alias list` — Show all aliases for this server
- `/alias delete <name>` — Remove an alias

### Resolution in /play

When a user types `/play gym-playlist`, the play command first checks if the query matches an alias in the DB for that guild. If yes, it uses the stored URL as the search query. If no, it proceeds as a normal search.

### Database

The `aliases` table already exists in the schema:
- `guild_id` — server scope
- `alias` — the name
- `playlist_id` — stores any URL (Spotify, YouTube, SoundCloud, etc.)
- Unique constraint on `(guild_id, alias)`

### Scope

Aliases accept any URL — Spotify playlists, YouTube playlists, SoundCloud sets, single tracks. No validation against source type.

## Changes Summary

| Area | Change |
|------|--------|
| `lavalink/application.yml` | Add LavaSrc plugin + Spotify config |
| `.env.example` | Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` |
| `src/db/repositories/aliasRepo.ts` | New: CRUD operations for aliases |
| `src/commands/alias.ts` | New: `/alias save/list/delete` subcommands |
| `src/commands/play.ts` | Add alias lookup before search |
| `src/commands/first.ts` | Add alias lookup before search |
| `src/i18n/messages.ts` | Add alias-related i18n strings |
