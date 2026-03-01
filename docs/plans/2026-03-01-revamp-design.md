# JuanitaMusic Revamp Design

**Date:** 2026-03-01
**Author:** Hauk Aleksander Olaussen + Claude
**License:** MIT (open source)

## Context

JuanitaMusic is a Discord music bot originally built in 2021-2023 with Discord.js v14, discord-player v5, and ytdl-core. The last commit was March 2023. All core dependencies are broken or abandoned, and the external Go API backend (hosted on GCP Cloud Run) is dead.

This is a clean rewrite preserving the original bot's soul — interactive queue embeds, Molde dialect personality, Spotify playlist integration — while modernizing the stack and adding LLM capabilities.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Proven ecosystem for Discord bots, original codebase was TS |
| Audio engine | Lavalink v4 via Shoukaku | Industry standard, reliable, offloads audio from Node.js |
| Queue management | Kazagumo | Queue abstraction on top of Shoukaku |
| Database | PostgreSQL via Drizzle ORM | Relational data (guilds→aliases→history), open-source friendly, pg_vector for future LLM embeddings |
| LLM provider | OpenRouter | Multi-model access, single API |
| Spotify | LavaSrc (Lavalink plugin) | Native Spotify resolution in Lavalink |
| Interaction model | Slash commands + @mention chat | Commands for music control, mentions for LLM conversation |
| Deployment | Railway (2 services) + Docker Compose | Cheapest always-on container hosting, open-source users can self-host with docker-compose |
| Personality | Molde dialect, expanded via LLM | Static i18n strings for Phase 1, LLM-generated personality responses in Phase 3 |

## Architecture

### Project Structure

```
src/
├── index.ts                    # Entry point
├── client.ts                   # JuanitaClient extends Discord.js Client
├── config.ts                   # Env-based config with validation
│
├── core/
│   ├── commandRegistry.ts      # Auto-loads & registers slash commands
│   ├── eventHandler.ts         # Auto-loads & registers Discord events
│   └── interactionRouter.ts    # Routes buttons/selects/modals to handlers
│
├── music/
│   ├── lavalinkManager.ts      # Shoukaku client setup & node management
│   ├── queueManager.ts         # Per-guild queue state
│   ├── playerController.ts     # Play/pause/skip/seek/volume operations
│   └── types.ts                # Track, Queue, PlayerState types
│
├── commands/
│   ├── play.ts
│   ├── skip.ts
│   ├── queue.ts
│   ├── pause.ts
│   ├── shuffle.ts
│   ├── jump.ts
│   ├── seek.ts
│   ├── remove.ts
│   ├── clear.ts
│   ├── kys.ts
│   ├── back.ts
│   ├── first.ts
│   ├── language.ts
│   ├── help.ts
│   └── ping.ts
│
├── interactions/
│   ├── buttons/                # skip, kys, pause, shuffle handlers
│   └── selectMenus/            # Queue song select handler
│
├── embeds/
│   ├── queueEmbed.ts           # Live-updating queue embed builder
│   └── simpleEmbed.ts          # Success/error/info embeds
│
├── i18n/
│   ├── messages.ts             # Static strings (en/no/molde)
│   └── types.ts
│
├── db/
│   ├── database.ts             # PostgreSQL connection via Drizzle
│   ├── schema.ts               # Drizzle schema
│   └── repositories/
│       ├── guildRepo.ts
│       ├── aliasRepo.ts
│       └── historyRepo.ts
│
└── utils/
    ├── time.ts
    └── spotify.ts
```

### Data Flow

```
User: /play "bohemian rhapsody"
  → Discord gateway → interactionCreate
  → interactionRouter → play.ts
  → playerController.play(guildId, query)
    → Shoukaku → Lavalink resolves track
    → queueManager.add(guildId, track)
    → Shoukaku plays on voice connection
    → queueEmbed.send(channel) → live embed with buttons
  → guildRepo.ensureGuild(guildId)
  → historyRepo.logPlay(track, user, guild)
```

### Database Schema

```sql
guilds (
  id          TEXT PRIMARY KEY,   -- Discord guild ID
  name        TEXT NOT NULL,
  language    TEXT DEFAULT 'no',  -- en | no | molde
  created_at  TIMESTAMP DEFAULT NOW()
)

aliases (
  id          SERIAL PRIMARY KEY,
  guild_id    TEXT REFERENCES guilds(id),
  alias       TEXT NOT NULL,
  playlist_id TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, alias)
)

history (
  id                SERIAL PRIMARY KEY,
  guild_id          TEXT REFERENCES guilds(id),
  title             TEXT NOT NULL,
  url               TEXT NOT NULL,
  duration_seconds  INTEGER,
  requested_by_id   TEXT NOT NULL,
  requested_by_tag  TEXT NOT NULL,
  played_at         TIMESTAMP DEFAULT NOW()
)
```

### Docker Setup

```yaml
services:
  lavalink:
    image: ghcr.io/lavalink-devs/lavalink:4
    volumes:
      - ./lavalink/application.yml:/opt/Lavalink/application.yml
    ports:
      - "2333:2333"
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: juanita
      POSTGRES_USER: juanita
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  juanita:
    build: .
    depends_on:
      - lavalink
      - postgres
    env_file: .env
    restart: unless-stopped

volumes:
  pgdata:
```

### Key Dependencies (Phase 1)

| Package | Purpose |
|---|---|
| discord.js v14 | Discord API |
| shoukaku | Lavalink client |
| kazagumo | Queue management |
| drizzle-orm + postgres | Database ORM |
| drizzle-kit | Migrations |
| dotenv | Config |
| typescript + tsx | Build & dev |

## Phase Roadmap

| Phase | Ships |
|---|---|
| **Phase 1** | Lavalink + all music commands + interactive embeds + PostgreSQL + Docker + i18n (en/no/molde) |
| **Phase 2** | Spotify integration via LavaSrc plugin + alias system |
| **Phase 3** | LLM via OpenRouter — recommendations, @mention chat, conversational DJ with Molde personality |
| **Phase 4** | Playlist curation, listening history analysis, smart mixes |

## Original Features Preserved

- All music commands: play, skip, back, first, jump, seek, pause, resume, shuffle, clear, kys, queue, remove
- Interactive queue embed with live progress bar, thumbnail, control buttons
- Button controls: KYS (disconnect), Skip, Pause/Resume, Shuffle
- Paginated queue with select menu for jumping to songs
- Per-guild language setting (en/no/molde)
- Spotify playlist aliases (store, list, play by alias)
- Custom greeting MP3 sounds
- The Molde dialect personality

## What's New

- Lavalink v4 for reliable audio (replaces broken discord-player + ytdl-core)
- PostgreSQL for persistence (replaces dead external Go API)
- Docker Compose for easy deployment
- Railway-ready for hosted product
- Future: LLM-powered conversational DJ, recommendations, smart curation via OpenRouter
