# Queue Embed Redesign

**Date:** 2026-03-01
**Author:** Hauk Aleksander Olaussen + Claude

## Goal

Redesign the queue embed to be clean, logical, and intuitive — with a clear information hierarchy, progress bar, inline queue list, and a single row of controls.

## Current Problems

- No progress bar or current position for the playing song
- 3 separate rows of controls (buttons + dropdown + page nav) feels cluttered
- Information hierarchy is flat — everything has equal visual weight
- "Next song" field is redundant when queue is shown
- Dropdown requires a click to see what's coming up

## New Layout

```
┌──────────────────────────────────────────┐
│ 🎵 Now Playing                     [thumb]│
│                                           │
│ **Bohemian Rhapsody**                     │
│ Added by @hauk                            │
│                                           │
│ ▶ ━━━━━━━━●━━━━━ 2:34 / 4:12             │
│                                           │
│ **Up Next** (5 songs · 18:42)             │
│ `1.` Never Gonna Give You Up — 3:33      │
│ `2.` Africa — 4:55                        │
│ `3.` Blinding Lights — 3:20              │
│ `4.` Take On Me — 3:48                   │
│ `5.` Levels — 3:06                        │
│ *...and 2 more*                           │
├──────────────────────────────────────────┤
│ [⏮️Back] [⏭️Skip] [⏸️Pause] [🔀Shuffle] [💀KYS] │
└──────────────────────────────────────────┘
```

## Changes

### Embed Body (description)
- Song title as bold hero text (linked to URL)
- Requester on its own line
- Unicode progress bar: `▶ ━━━━━━●━━━━ 2:34 / 4:12` (or `⏸` when paused)
- "Up Next" section with song count + total remaining time in header
- Next 5-8 songs shown inline with position number and duration
- "...and N more" if queue exceeds display limit

### Controls
- Single button row: Back, Skip, Pause/Resume, Shuffle, KYS
- Back button added (was missing from embed controls)
- Back and Skip disabled contextually (no previous / empty queue)

### Removed
- Select menu dropdown (replaced by inline list)
- Page navigation buttons (not needed)
- Separate "Total time" and "Song count" embed fields (merged into Up Next header)
- "Next song in queue" field (redundant — it's item 1 in the list)

## Files Changed

- `src/embeds/queueEmbed.ts` — full rewrite of `buildQueueEmbed()`
- `src/utils/time.ts` — add `buildProgressBar()` helper
- `src/i18n/messages.ts` — update/add queue-related strings
- `src/interactions/buttons/index.ts` — add `btn:back` handler
- `src/interactions/selectMenus/queueSelect.ts` — can be deleted (no longer used)
- `src/core/interactionRouter.ts` — remove select menu routing
