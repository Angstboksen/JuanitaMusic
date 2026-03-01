# JuanitaMusic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A Discord music bot for playing music with friends. Built with TypeScript, Discord.js v14, and Lavalink v4.

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Angstboksen/JuanitaMusic.git
cd JuanitaMusic
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your BOT_TOKEN and optionally DEV_GUILD_ID
```

### 3. Start infrastructure

```bash
docker compose up -d lavalink postgres
```

### 4. Run database migrations

```bash
npm run db:push
```

### 5. Start the bot

```bash
npm run dev
```

## Docker (full stack)

Run everything in Docker:

```bash
docker compose up -d
```

## Commands

| Command | Description |
| --- | --- |
| `/play <song>` | Play a song from a search query or URL |
| `/first <song>` | Add a song to the front of the queue |
| `/skip` | Skip the current song |
| `/back` | Play the previous song |
| `/pause` | Toggle pause/resume |
| `/shuffle` | Shuffle the queue |
| `/jump <position>` | Jump to a position in the queue |
| `/seek <seconds>` | Seek to a time in the current song |
| `/remove <position>` | Remove a song from the queue |
| `/clear` | Clear the queue |
| `/queue` | Show the live queue embed |
| `/kys` | Disconnect the bot |
| `/ping` | Check bot latency |
| `/help` | List all commands |
| `/language <lang>` | Change bot language (en/no/molde) |

## Languages

JuanitaMusic supports three languages per server:
- **en** — English
- **no** — Norwegian
- **molde** — Molde dialect (the bot's original personality)

## Tech Stack

- **TypeScript** + Discord.js v14
- **Lavalink v4** via Shoukaku + Kazagumo
- **PostgreSQL** via Drizzle ORM
- **Docker Compose** for Lavalink + Postgres + Bot

## License

[MIT](./LICENSE)
