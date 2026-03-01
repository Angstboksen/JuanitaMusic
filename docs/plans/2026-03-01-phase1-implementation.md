# Phase 1: Core Music Bot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully working Discord music bot with Lavalink audio, all original music commands, interactive queue embeds, PostgreSQL persistence, i18n (en/no/molde), and Docker deployment.

**Architecture:** Clean TypeScript project with Discord.js v14, Kazagumo (Shoukaku wrapper) for Lavalink v4 audio, Drizzle ORM with postgres-js for PostgreSQL, and Docker Compose for Lavalink + Postgres + Bot.

**Tech Stack:** TypeScript, Discord.js v14, Kazagumo/Shoukaku, Lavalink v4, Drizzle ORM, PostgreSQL, Docker

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `lavalink/application.yml`
- Create: `drizzle.config.ts`

**Step 1: Clean out old source and create new package.json**

Remove all old source files (they're preserved on `main` branch) and create a fresh `package.json`:

```bash
rm -rf src index.ts config.ts openapitools.json package-lock.json .eslintrc.json .prettierrc
rm -rf .github
```

```json
{
  "name": "juanitamusic",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.ts",
  "repository": "https://github.com/Angstboksen/JuanitaMusic.git",
  "author": "Hauk Aleksander Olaussen <olaussen.hauk@gmail.com>",
  "license": "MIT",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "build": "tsc",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "discord.js": "^14.16.3",
    "kazagumo": "^3.4.1",
    "shoukaku": "^4.1.1",
    "drizzle-orm": "^0.39.3",
    "postgres": "^3.4.5",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "tsx": "^4.19.2",
    "drizzle-kit": "^0.30.4",
    "@types/node": "^22.10.5"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .env.example**

```env
# Discord
BOT_TOKEN=your_discord_bot_token
DEV_GUILD_ID=optional_guild_id_for_dev

# Lavalink
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# Database
DATABASE_URL=postgres://juanita:juanita@localhost:5432/juanita
```

**Step 4: Create .gitignore**

```gitignore
node_modules/
dist/
.env
*.tsbuildinfo
data/
lavalink/plugins/
```

**Step 5: Create Dockerfile**

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

CMD ["npm", "start"]
```

**Step 6: Create docker-compose.yml**

```yaml
services:
  lavalink:
    image: ghcr.io/lavalink-devs/lavalink:4-alpine
    container_name: juanita-lavalink
    restart: unless-stopped
    environment:
      - _JAVA_OPTIONS=-Xmx1G
    volumes:
      - ./lavalink/application.yml:/opt/Lavalink/application.yml
      - ./lavalink/plugins/:/opt/Lavalink/plugins/
    expose:
      - "2333"
    ports:
      - "2333:2333"

  postgres:
    image: postgres:16-alpine
    container_name: juanita-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: juanita
      POSTGRES_USER: juanita
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-juanita}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  juanita:
    build: .
    container_name: juanita-bot
    restart: unless-stopped
    depends_on:
      - lavalink
      - postgres
    environment:
      - LAVALINK_HOST=lavalink
      - LAVALINK_PORT=2333
      - LAVALINK_PASSWORD=youshallnotpass
      - DATABASE_URL=postgres://juanita:${POSTGRES_PASSWORD:-juanita}@postgres:5432/juanita
    env_file: .env

volumes:
  pgdata:
```

**Step 7: Create lavalink/application.yml**

```yaml
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  plugins:
    - dependency: "dev.lavalink.youtube:youtube-plugin:1.18.0"
      snapshot: false
  server:
    password: "youshallnotpass"
    sources:
      youtube: false
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    opusEncodingQuality: 10
    resamplingQuality: LOW
    trackStuckThresholdMs: 10000
    useSeekGhosting: true
    playerUpdateInterval: 5
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true

plugins:
  youtube:
    enabled: true
    allowSearch: true
    allowDirectVideoIds: true
    allowDirectPlaylistIds: true
    clients:
      - MUSIC
      - ANDROID_VR
      - WEB

logging:
  level:
    root: INFO
    lavalink: INFO
```

**Step 8: Create drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 9: Install dependencies and commit**

```bash
npm install
git add -A
git commit -m "feat: project scaffolding with Docker, Lavalink, and Drizzle config"
```

---

### Task 2: Config, Client & Entry Point

**Files:**
- Create: `src/config.ts`
- Create: `src/client.ts`
- Create: `src/index.ts`

**Step 1: Create src/config.ts**

Validates required environment variables at startup.

```typescript
import "dotenv/config";

export interface JuanitaConfig {
  bot: {
    token: string;
    devGuildId?: string;
  };
  lavalink: {
    host: string;
    port: number;
    password: string;
  };
  database: {
    url: string;
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config: JuanitaConfig = {
  bot: {
    token: requireEnv("BOT_TOKEN"),
    devGuildId: process.env.DEV_GUILD_ID,
  },
  lavalink: {
    host: process.env.LAVALINK_HOST ?? "localhost",
    port: parseInt(process.env.LAVALINK_PORT ?? "2333"),
    password: process.env.LAVALINK_PASSWORD ?? "youshallnotpass",
  },
  database: {
    url: requireEnv("DATABASE_URL"),
  },
};
```

**Step 2: Create src/client.ts**

```typescript
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Kazagumo, KazagumoPlayer } from "kazagumo";
import { Connectors } from "shoukaku";
import { config } from "./config.js";
import type { JuanitaCommand } from "./commands/types.js";

export class JuanitaClient extends Client {
  public kazagumo: Kazagumo;
  public commands: Collection<string, JuanitaCommand> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this),
      [
        {
          name: "main",
          url: `${config.lavalink.host}:${config.lavalink.port}`,
          auth: config.lavalink.password,
          secure: false,
        },
      ],
    );
  }

  public getPlayer(guildId: string): KazagumoPlayer | undefined {
    return this.kazagumo.getPlayer(guildId);
  }
}
```

**Step 3: Create src/index.ts**

```typescript
import { config } from "./config.js";
import { JuanitaClient } from "./client.js";

const client = new JuanitaClient();

// Lavalink events
client.kazagumo.shoukaku.on("ready", (name) =>
  console.log(`[Lavalink] Node ${name}: Ready`),
);
client.kazagumo.shoukaku.on("error", (name, error) =>
  console.error(`[Lavalink] Node ${name}: Error`, error),
);
client.kazagumo.shoukaku.on("disconnect", (name) =>
  console.log(`[Lavalink] Node ${name}: Disconnected`),
);

// Discord ready
client.on("ready", (c) => {
  console.log(`[Bot] Logged in as ${c.user.tag}`);
});

client.login(config.bot.token);
```

**Step 4: Commit**

```bash
git add src/config.ts src/client.ts src/index.ts
git commit -m "feat: config, client, and entry point with Kazagumo/Lavalink setup"
```

---

### Task 3: Database Layer

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/database.ts`
- Create: `src/db/repositories/guildRepo.ts`
- Create: `src/db/repositories/historyRepo.ts`

**Step 1: Create src/db/schema.ts**

```typescript
import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const guilds = pgTable("guilds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  language: text("language").notNull().default("no"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aliases = pgTable(
  "aliases",
  {
    id: serial("id").primaryKey(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id),
    alias: text("alias").notNull(),
    playlistId: text("playlist_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.guildId, t.alias)],
);

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  durationSeconds: integer("duration_seconds"),
  requestedById: text("requested_by_id").notNull(),
  requestedByTag: text("requested_by_tag").notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});
```

**Step 2: Create src/db/database.ts**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config.js";
import * as schema from "./schema.js";

export const db = drizzle(config.database.url, { schema });
```

**Step 3: Create src/db/repositories/guildRepo.ts**

```typescript
import { eq } from "drizzle-orm";
import { db } from "../database.js";
import { guilds } from "../schema.js";

export type Language = "en" | "no" | "molde";

export async function ensureGuild(id: string, name: string) {
  const existing = await db.select().from(guilds).where(eq(guilds.id, id)).limit(1);
  if (existing.length > 0) return existing[0]!;

  const result = await db.insert(guilds).values({ id, name }).returning();
  return result[0]!;
}

export async function getGuildLanguage(guildId: string): Promise<Language> {
  const result = await db.select({ language: guilds.language }).from(guilds).where(eq(guilds.id, guildId)).limit(1);
  return (result[0]?.language as Language) ?? "no";
}

export async function setGuildLanguage(guildId: string, language: Language) {
  await db.update(guilds).set({ language }).where(eq(guilds.id, guildId));
}
```

**Step 4: Create src/db/repositories/historyRepo.ts**

```typescript
import { db } from "../database.js";
import { history } from "../schema.js";

export async function logPlay(data: {
  guildId: string;
  title: string;
  url: string;
  durationSeconds?: number;
  requestedById: string;
  requestedByTag: string;
}) {
  await db.insert(history).values(data);
}
```

**Step 5: Generate initial migration and commit**

```bash
npx drizzle-kit generate
git add src/db/ drizzle/ drizzle.config.ts
git commit -m "feat: database layer with Drizzle schema and repositories"
```

---

### Task 4: i18n System

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/messages.ts`

**Step 1: Create src/i18n/types.ts**

```typescript
export type Language = "en" | "no" | "molde";

export type LocalizedString = Record<Language, string>;
```

**Step 2: Create src/i18n/messages.ts**

Port all messages from the original `src/embeds/messages.ts`. Use the new `LocalizedString` type. This file is large but straightforward — it's a direct port of the original i18n strings.

```typescript
import type { LocalizedString } from "./types.js";

// === Error messages ===

export const GENERIC_ERROR: LocalizedString = {
  en: "An error occurred, please try again later!",
  no: "En feil oppstod, prøv igjen senere!",
  molde: "FAEN I HÆLVETTE NA DRITEN HER FUCKA SE!",
};

export const CANT_JOIN_CHANNEL: LocalizedString = {
  en: "I am unable to join the voice channel. Check if I have access!",
  no: "Jeg får ikke til å joine kanalen. Sjekk om jeg har tilgang!",
  molde: "KA FAEN! I FÅR IKKJE JOINA KANALEN! SJEKK OM I HAR TILGANG TE NA FITTA!",
};

export const NO_MUSIC_PLAYING: LocalizedString = {
  en: "There is no music playing right now",
  no: "Det spilles ingen musikk for øyeblikket",
  molde: "I SPILLE IKKJE MUSIKK NO JÆVLA HORE",
};

export const NOT_IN_VOICE: LocalizedString = {
  en: "You are not in a Voice Channel",
  no: "Du er ikke i en voice kanal",
  molde: "FAEN E DU HEILT RETARD!? DU E IKKJE I VOICE!",
};

export const NOT_IN_SAME_VOICE: LocalizedString = {
  en: "You are not in the same Voice Channel as me",
  no: "Du er ikke i samme voice kanal som meg",
  molde: "ASSÅ FAEN SÅ JÆVLA DUM DU E! DU MÅ VÆRE I SAMMME KANAL SOM ME!",
};

export const EMPTY_QUEUE: LocalizedString = {
  en: "The queue is empty!",
  no: "Køen er tom!",
  molde: "KØA E TOM! FAEN E DU DUM!",
};

export const NO_PREVIOUS_TRACK: LocalizedString = {
  en: "There is no previous track to play",
  no: "Det er ingen tidligere sang å spille",
  molde: "I KAN IKKJE SPILLE EN SANG SOM IKKJE FINNES JÆVLA MONGO!",
};

export const COMMAND_NOT_FOUND: LocalizedString = {
  en: "Command does not exist!",
  no: "Kommandoen finnes ikke!",
  molde: "NA KOMMANDOEN FINNES IKKJE, JÆVLA TARD!",
};

export const NO_RESULTS: LocalizedString = {
  en: "No results found for search:",
  no: "Fant ingen resultater for søk:",
  molde: "KA I HÆLVETTE, KORDAN DU FORVENTE AT I SKAL FINNE NOKKA MED TA ELENDIGE SØKET:",
};

export const INVALID_POSITION: LocalizedString = {
  en: "Please provide a valid queue position between:",
  no: "Vennligst oppgi en gyldig kø posisjon mellom:",
  molde: "HERREGUD DU E DUM! GI ME EN GYLDIG POSISJON I KØA MELLOM:",
};

export const INVALID_SEEK_TIME: LocalizedString = {
  en: "The time you provided is invalid for this song!",
  no: "Tiden du oppga er ugyldig for denne sangen!",
  molde: "FY FAEN DU E TARD! PRØV Å LEGG INN GYLDIG TID DA MONGO!",
};

export const ALREADY_PAUSED: LocalizedString = {
  en: "The song is already paused!",
  no: "Sangen er allerede pauset!",
  molde: "SANGEN E ALLEREDE PAUSA!",
};

export const ALREADY_PLAYING: LocalizedString = {
  en: "The song is already playing!",
  no: "Sangen spilles allerede!",
  molde: "SANGEN SPILLES ALLEREDE DI FORBANNA FITTE!",
};

export const LANGUAGE_INVALID: LocalizedString = {
  en: "You have to provide a valid language.\nSupported languages:",
  no: "Du må gi et gyldig språk.\nSpråk som støttes:",
  molde: "DU MÅ GI ME ET GYLDIG SPRÅK.\nSPRÅKA SOM STØTTES NO ER:",
};

// === Success messages ===

export const TRACK_ADDED: LocalizedString = {
  en: "Added track:",
  no: "La til sang:",
  molde: "LA TE SANG:",
};

export const PLAYLIST_ADDED: LocalizedString = {
  en: "Added all songs from playlist:",
  no: "La til alle sanger fra spillelista:",
  molde: "LA TE ALLE SANGAN FRA SPILLELISTA:",
};

export const SKIP_FROM: LocalizedString = {
  en: "Skipping track:",
  no: "Skipper sang:",
  molde: "SKIPPA SANG:",
};

export const SKIP_TO: LocalizedString = {
  en: "Next track:",
  no: "Neste sang:",
  molde: "NESTE SANG:",
};

export const SHUFFLE_SUCCESS: LocalizedString = {
  en: "Shuffled the queue!",
  no: "Shufflet køen!",
  molde: "SHUFFLA KØA!",
};

export const CLEAR_SUCCESS: LocalizedString = {
  en: "Cleared the queue!",
  no: "Tømte køen!",
  molde: "TØMTE KØA I MORDI!",
};

export const PAUSE_SUCCESS: LocalizedString = {
  en: "has been paused!",
  no: "er satt på pause!",
  molde: "E SATT PÅ PAUSE!",
};

export const RESUME_SUCCESS: LocalizedString = {
  en: "has been resumed!",
  no: "er satt på igjen!",
  molde: "E SATT PÅ IGJEN!",
};

export const KYS_SUCCESS: LocalizedString = {
  en: "Ait I'm out",
  no: "Chattes a!",
  molde: "SUG PÅ DENNA!",
};

export const BACK_SUCCESS: LocalizedString = {
  en: "Playing previous track:",
  no: "Spiller forrige sang:",
  molde: "SPILLER FORRIGE SANG:",
};

export const JUMP_SUCCESS: LocalizedString = {
  en: "Jumped to track:",
  no: "Hoppet til sang:",
  molde: "HOPPA TE SANG:",
};

export const SEEK_SUCCESS: LocalizedString = {
  en: "Moved to time:",
  no: "Spolet til:",
  molde: "SPOLA TE:",
};

export const REMOVE_SUCCESS: LocalizedString = {
  en: "Removed track:",
  no: "Fjernet sang:",
  molde: "FJERNA SANG:",
};

export const LANGUAGE_SET: LocalizedString = {
  en: "Language set to:",
  no: "Språk satt til:",
  molde: "SPRÅK SATT TE:",
};

export const QUEUE_SENDING: LocalizedString = {
  en: "Sending queue message!",
  no: "Sender kømelding!",
  molde: "SENDE KØMELDING!",
};

// === Queue embed strings ===

export const QUEUE_NOW_PLAYING: LocalizedString = {
  en: "**Now playing:**",
  no: "**Akkurat nå:**",
  molde: "**AKKURAT NO:**",
};

export const QUEUE_ADDED_BY: LocalizedString = {
  en: "**Added by:**",
  no: "**Lagt til av:**",
  molde: "**LAGT TE AV:**",
};

export const QUEUE_TOTAL_TIME: LocalizedString = {
  en: "Total time left:",
  no: "Total tid igjen:",
  molde: "TOTAL TID IGJEN:",
};

export const QUEUE_SONG_COUNT: LocalizedString = {
  en: "Songs in queue:",
  no: "Antall sanger i køen:",
  molde: "ANTALL SANGA I KØA:",
};

export const QUEUE_NEXT_SONG: LocalizedString = {
  en: "**Next song in queue:**",
  no: "**Neste sang i køen:**",
  molde: "**NESTE SANG I KØA:**",
};

export const QUEUE_EMPTY: LocalizedString = {
  en: "The queue is empty! Use `/play <song>` to add a song!",
  no: "Køen er tom! Bruk `/play <sang>` for å legge til en sang!",
  molde: "KØA E TOM! BRUK `/play <sang>` FOR Å LEGGE TE EN SANG!",
};

export const QUEUE_SELECT_PLACEHOLDER: LocalizedString = {
  en: "Open me to view the queue | Songs:",
  no: "Åpne meg for å se køen | Sanger:",
  molde: "ÅPNE ME FOR Å SE KØA DI HORE | Sanga:",
};

export const QUEUE_AUTHOR: LocalizedString = {
  en: "Current queue",
  no: "Nåværende kø",
  molde: "NÅVÆRENDE KØ",
};

// === Button labels ===

export const BTN_KYS: LocalizedString = { en: "KYS", no: "KYS", molde: "KYS" };
export const BTN_SKIP: LocalizedString = { en: "Skip", no: "Skip", molde: "SKIP" };
export const BTN_PAUSE: LocalizedString = { en: "Pause", no: "Pause", molde: "PAUSE" };
export const BTN_RESUME: LocalizedString = { en: "Resume", no: "Fortsett", molde: "FORTSETT" };
export const BTN_SHUFFLE: LocalizedString = { en: "Shuffle", no: "Shuffle", molde: "SHUFFLE" };
export const BTN_PREV_PAGE: LocalizedString = { en: "Previous", no: "Forrige", molde: "FORRIGE" };
export const BTN_NEXT_PAGE: LocalizedString = { en: "Next", no: "Neste", molde: "NESTE" };

// === Help ===

export const HELP_DESCRIPTION: LocalizedString = {
  en: "**Here is a list of all commands**\nUse `/help <command>` for more info",
  no: "**Her er en liste over alle kommandoer**\nBruk `/help <kommando>` for mer info",
  molde: "**HER E LISTA MED ALLE KOMMANDOA LILLE TØS**\nBRUK `/help <kommando>` HVIS DU E RETARD",
};
```

**Step 3: Commit**

```bash
git add src/i18n/
git commit -m "feat: i18n system with en/no/molde translations"
```

---

### Task 5: Embed Builders

**Files:**
- Create: `src/embeds/simpleEmbed.ts`
- Create: `src/embeds/queueEmbed.ts`

**Step 1: Create src/embeds/simpleEmbed.ts**

```typescript
import { EmbedBuilder } from "discord.js";

export enum EmbedType {
  Success = "#00ff00",
  Error = "#ff0000",
  Info = "#0000ff",
}

export function simpleEmbed(description: string, type: EmbedType): EmbedBuilder {
  return new EmbedBuilder().setColor(type).setDescription(description);
}
```

**Step 2: Create src/embeds/queueEmbed.ts**

This recreates the original live-updating queue embed with buttons, progress info, and paginated select menu. This is the largest single file — it builds the rich Discord embed showing: current track, progress, controls, queue list.

```typescript
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type Message,
  type TextChannel,
} from "discord.js";
import type { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import type { Language } from "../i18n/types.js";
import {
  BTN_KYS, BTN_SKIP, BTN_PAUSE, BTN_RESUME, BTN_SHUFFLE,
  BTN_PREV_PAGE, BTN_NEXT_PAGE,
  QUEUE_NOW_PLAYING, QUEUE_ADDED_BY, QUEUE_TOTAL_TIME,
  QUEUE_SONG_COUNT, QUEUE_NEXT_SONG, QUEUE_EMPTY,
  QUEUE_SELECT_PLACEHOLDER, QUEUE_AUTHOR,
} from "../i18n/messages.js";
import { millisecondsToTime } from "../utils/time.js";

export interface QueueEmbedState {
  message: Message | null;
  interval: NodeJS.Timeout | null;
  page: number;
}

export function createQueueState(): QueueEmbedState {
  return { message: null, interval: null, page: 0 };
}

export function buildQueueEmbed(
  player: KazagumoPlayer,
  lang: Language,
  page: number,
  botAvatarUrl?: string,
) {
  const current = player.queue.current;
  if (!current) return null;

  const tracks = [...player.queue];
  const totalMs = tracks.reduce((acc, t) => acc + (t.length ?? 0), 0);

  const nextSong = tracks.length > 0
    ? `[${tracks[0]!.title}](${tracks[0]!.uri})`
    : QUEUE_EMPTY[lang];

  const embed = new EmbedBuilder()
    .setColor("#0000ff")
    .setDescription(
      `${QUEUE_NOW_PLAYING[lang]} [${current.title}](${current.uri})\n` +
      `${QUEUE_ADDED_BY[lang]} ${current.requester ?? "Unknown"}\n`,
    )
    .setThumbnail(current.thumbnail ?? null)
    .setAuthor({ name: QUEUE_AUTHOR[lang], iconURL: botAvatarUrl })
    .addFields(
      { name: QUEUE_TOTAL_TIME[lang], value: `\`${millisecondsToTime(totalMs)}\``, inline: true },
      { name: QUEUE_SONG_COUNT[lang], value: `\`${tracks.length}\``, inline: true },
      { name: QUEUE_NEXT_SONG[lang], value: nextSong, inline: false },
    );

  const paused = player.paused;
  const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel(`💀${BTN_KYS[lang]}`).setStyle(ButtonStyle.Danger).setCustomId("btn:kys"),
    new ButtonBuilder().setLabel(`⏭️${BTN_SKIP[lang]}`).setStyle(ButtonStyle.Primary).setCustomId("btn:skip").setDisabled(tracks.length === 0),
    new ButtonBuilder().setLabel(paused ? `▶️${BTN_RESUME[lang]}` : `⏸️${BTN_PAUSE[lang]}`).setStyle(paused ? ButtonStyle.Success : ButtonStyle.Danger).setCustomId("btn:pause"),
    new ButtonBuilder().setLabel(`🔀${BTN_SHUFFLE[lang]}`).setStyle(ButtonStyle.Primary).setCustomId("btn:shuffle").setDisabled(tracks.length === 0),
  );

  if (tracks.length === 0) return { embed, components: [controlRow] };

  const maxPage = Math.ceil(tracks.length / 25);
  const pageSlice = tracks.slice(page * 25, (page + 1) * 25);

  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("queue_select")
      .setPlaceholder(`${QUEUE_SELECT_PLACEHOLDER[lang]} ${page * 25 + 1}/${Math.min((page + 1) * 25, tracks.length)}`)
      .addOptions(
        pageSlice.map((track, i) => ({
          label: `${page * 25 + i + 1}. ${track.title?.slice(0, 50) ?? "Unknown"}`,
          value: `${page * 25 + i}`,
        })),
      ),
  );

  const pageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("btn:prev_page").setLabel(`⬅️${BTN_PREV_PAGE[lang]}`).setStyle(ButtonStyle.Primary).setDisabled(page === 0),
    new ButtonBuilder().setCustomId("btn:next_page").setLabel(`➡️${BTN_NEXT_PAGE[lang]}`).setStyle(ButtonStyle.Primary).setDisabled(page >= maxPage - 1),
  );

  return { embed, components: [controlRow, selectMenu, pageRow] };
}

export async function sendOrUpdateQueueEmbed(
  state: QueueEmbedState,
  player: KazagumoPlayer,
  lang: Language,
  channel?: TextChannel,
  botAvatarUrl?: string,
) {
  const result = buildQueueEmbed(player, lang, state.page, botAvatarUrl);
  if (!result) {
    await cleanupQueueEmbed(state);
    return;
  }

  const { embed, components } = result;

  if (state.message) {
    try {
      await state.message.edit({ embeds: [embed], components });
    } catch {
      state.message = null;
    }
  } else if (channel) {
    state.message = await channel.send({ embeds: [embed], components });
  }
}

export async function cleanupQueueEmbed(state: QueueEmbedState) {
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
  if (state.message) {
    try { await state.message.delete(); } catch {}
    state.message = null;
  }
  state.page = 0;
}

export function startQueueInterval(
  state: QueueEmbedState,
  player: KazagumoPlayer,
  lang: Language,
  channel: TextChannel,
  botAvatarUrl?: string,
) {
  if (state.interval) clearInterval(state.interval);
  state.interval = setInterval(() => {
    sendOrUpdateQueueEmbed(state, player, lang, channel, botAvatarUrl);
  }, 4000);
}
```

**Step 3: Create src/utils/time.ts**

```typescript
export function millisecondsToTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
```

**Step 4: Commit**

```bash
git add src/embeds/ src/utils/
git commit -m "feat: embed builders with live-updating queue display and controls"
```

---

### Task 6: Core Framework — Command Registry & Interaction Router

**Files:**
- Create: `src/commands/types.ts`
- Create: `src/core/commandRegistry.ts`
- Create: `src/core/interactionRouter.ts`

**Step 1: Create src/commands/types.ts**

```typescript
import type { CommandInteraction, ApplicationCommandOptionData } from "discord.js";
import type { JuanitaClient } from "../client.js";
import type { Language } from "../i18n/types.js";

export interface JuanitaCommand {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  voiceChannel?: boolean;
  execute: (ctx: CommandContext) => Promise<void>;
}

export interface CommandContext {
  interaction: CommandInteraction;
  client: JuanitaClient;
  lang: Language;
}
```

**Step 2: Create src/core/commandRegistry.ts**

Uses dynamic import to load all command files from `src/commands/`.

```typescript
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { JuanitaClient } from "../client.js";
import type { JuanitaCommand } from "../commands/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function registerCommands(client: JuanitaClient) {
  const commandsDir = join(__dirname, "..", "commands");
  const files = readdirSync(commandsDir).filter(
    (f) => f.endsWith(".ts") && f !== "types.ts",
  );

  const commandData: JuanitaCommand[] = [];

  for (const file of files) {
    const mod = await import(join(commandsDir, file));
    const command: JuanitaCommand = mod.default;
    if (command.name && command.description) {
      client.commands.set(command.name, command);
      commandData.push(command);
      console.log(`[Command] Loaded: ${command.name}`);
    }
  }

  return commandData;
}
```

**Step 3: Create src/core/interactionRouter.ts**

Routes slash commands, buttons, and select menus.

```typescript
import { GuildMember, Interaction, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { ensureGuild } from "../db/repositories/guildRepo.js";
import { getGuildLanguage } from "../db/repositories/guildRepo.js";
import * as msg from "../i18n/messages.js";
import type { Language } from "../i18n/types.js";

// Per-guild state cache (language + queue embed state)
import { guildStates, getOrCreateGuildState } from "../music/guildState.js";

export function setupInteractionHandler(client: JuanitaClient) {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.guild || !interaction.guildId) return;

    const state = await getOrCreateGuildState(interaction.guildId, interaction.guild.name);

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({
          embeds: [simpleEmbed(msg.COMMAND_NOT_FOUND[state.lang], EmbedType.Error)],
          ephemeral: true,
        });
        return;
      }

      // Voice channel check
      if (command.voiceChannel) {
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          await interaction.reply({
            embeds: [simpleEmbed(msg.NOT_IN_VOICE[state.lang], EmbedType.Error)],
            ephemeral: true,
          });
          return;
        }
        if (
          interaction.guild.members.me?.voice.channel &&
          member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
        ) {
          await interaction.reply({
            embeds: [simpleEmbed(msg.NOT_IN_SAME_VOICE[state.lang], EmbedType.Error)],
            ephemeral: true,
          });
          return;
        }
      }

      try {
        await command.execute({ interaction, client, lang: state.lang });
      } catch (error) {
        console.error(`[Command Error] ${interaction.commandName}:`, error);
        const reply = interaction.deferred || interaction.replied
          ? interaction.editReply.bind(interaction)
          : interaction.reply.bind(interaction);
        await reply({
          embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)],
          ephemeral: true,
        }).catch(() => {});
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      const handler = (await import("../interactions/buttons/index.js")).buttonHandlers[buttonId];
      if (handler) {
        await handler(interaction, client, state);
      }
      return;
    }

    // Select menus
    if (interaction.isStringSelectMenu() && interaction.customId === "queue_select") {
      const handler = (await import("../interactions/selectMenus/queueSelect.js")).default;
      await handler(interaction, client, state);
      return;
    }
  });
}
```

**Step 4: Create src/music/guildState.ts**

Per-guild runtime state (language, queue embed state).

```typescript
import type { Language } from "../i18n/types.js";
import { ensureGuild, getGuildLanguage } from "../db/repositories/guildRepo.js";
import { createQueueState, type QueueEmbedState } from "../embeds/queueEmbed.js";

export interface GuildState {
  lang: Language;
  queueEmbed: QueueEmbedState;
}

export const guildStates = new Map<string, GuildState>();

export async function getOrCreateGuildState(guildId: string, guildName: string): Promise<GuildState> {
  let state = guildStates.get(guildId);
  if (state) return state;

  await ensureGuild(guildId, guildName);
  const lang = await getGuildLanguage(guildId);

  state = {
    lang,
    queueEmbed: createQueueState(),
  };
  guildStates.set(guildId, state);
  return state;
}
```

**Step 5: Commit**

```bash
git add src/commands/types.ts src/core/ src/music/guildState.ts
git commit -m "feat: command registry, interaction router, and guild state management"
```

---

### Task 7: Music Commands

**Files:**
- Create: `src/commands/play.ts`
- Create: `src/commands/skip.ts`
- Create: `src/commands/pause.ts`
- Create: `src/commands/shuffle.ts`
- Create: `src/commands/clear.ts`
- Create: `src/commands/kys.ts`
- Create: `src/commands/back.ts`
- Create: `src/commands/jump.ts`
- Create: `src/commands/seek.ts`
- Create: `src/commands/remove.ts`
- Create: `src/commands/first.ts`
- Create: `src/commands/queue.ts`

**Step 1: Create src/commands/play.ts**

The core command — searches via Kazagumo, creates a player, adds to queue.

```typescript
import { ApplicationCommandOptionType, GuildMember, TextChannel } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { startQueueInterval, sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "play",
  description: "Play a song from a search query or URL!",
  voiceChannel: true,
  options: [
    {
      name: "song",
      description: "Song name, YouTube URL, or SoundCloud URL",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  async execute({ interaction, client, lang }) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member as GuildMember;
    const query = interaction.options.get("song", true).value as string;

    const result = await client.kazagumo.search(query, { requester: member });
    if (!result.tracks.length) {
      await interaction.editReply({
        embeds: [simpleEmbed(`${msg.NO_RESULTS[lang]} \`${query}\``, EmbedType.Error)],
      });
      return;
    }

    let player = client.getPlayer(interaction.guildId!);
    if (!player) {
      player = await client.kazagumo.createPlayer({
        guildId: interaction.guildId!,
        textId: interaction.channelId,
        voiceId: member.voice.channel!.id,
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

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    const channel = interaction.channel as TextChannel;
    startQueueInterval(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());

    const title = isPlaylist ? result.playlistName : result.tracks[0]!.title;
    const message = isPlaylist ? msg.PLAYLIST_ADDED : msg.TRACK_ADDED;
    await interaction.editReply({
      embeds: [simpleEmbed(`${message[lang]} \`${title}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
```

**Step 2: Create src/commands/skip.ts**

```typescript
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { cleanupQueueEmbed, sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "skip",
  description: "Skip to the next song in the queue!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const from = player.queue.current.title;
    const tracks = [...player.queue];
    const to = tracks.length > 0 ? tracks[0]!.title : msg.EMPTY_QUEUE[lang];

    player.skip();

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`⏭️ ${msg.SKIP_FROM[lang]} \`${from}\`\n🎶 ${msg.SKIP_TO[lang]} \`${to}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
```

**Step 3: Create remaining commands (src/commands/pause.ts, shuffle.ts, clear.ts, kys.ts, back.ts, jump.ts, seek.ts, remove.ts, first.ts, queue.ts)**

Each follows the same pattern: check player exists, perform action, update queue embed, reply. They are direct ports of the original commands adapted to Kazagumo's API:

- **pause.ts**: `player.pause(!player.paused)`, reply with pause/resume message
- **shuffle.ts**: `player.queue.shuffle()`, reply with shuffle success
- **clear.ts**: `player.queue.clear()`, reply with clear success
- **kys.ts**: `player.destroy()` + cleanup queue embed, reply with KYS message
- **back.ts**: `player.play(player.getPrevious())`, reply with back success
- **jump.ts**: Takes `position` option, `player.queue.splice(0, position - 1)` then `player.skip()`, reply with jump success
- **seek.ts**: Takes `seconds` option, `player.shoukaku.seekTo(seconds * 1000)`, reply with seek success
- **remove.ts**: Takes `position` option, `player.queue.splice(position - 1, 1)`, reply with remove success
- **first.ts**: Search and `player.queue.unshift(track)` to add at front of queue
- **queue.ts**: Sends the queue embed to the current channel, starts the update interval

**Step 4: Commit**

```bash
git add src/commands/
git commit -m "feat: all music commands — play, skip, pause, shuffle, clear, kys, back, jump, seek, remove, first, queue"
```

---

### Task 8: Utility Commands

**Files:**
- Create: `src/commands/ping.ts`
- Create: `src/commands/help.ts`
- Create: `src/commands/language.ts`

**Step 1: Create src/commands/ping.ts**

```typescript
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "ping",
  description: "Check bot latency",

  async execute({ interaction, client }) {
    await interaction.reply({
      embeds: [simpleEmbed(`Pong! \`${client.ws.ping}ms\``, EmbedType.Info)],
      ephemeral: true,
    });
  },
} as JuanitaCommand;
```

**Step 2: Create src/commands/help.ts**

```typescript
import { EmbedBuilder } from "discord.js";
import * as msg from "../i18n/messages.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "help",
  description: "List all available commands",

  async execute({ interaction, client, lang }) {
    const commands = [...client.commands.values()];
    const embed = new EmbedBuilder()
      .setColor("#0000ff")
      .setDescription(msg.HELP_DESCRIPTION[lang])
      .addFields(
        commands.map((cmd) => ({
          name: `/${cmd.name}`,
          value: cmd.description,
          inline: true,
        })),
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
} as JuanitaCommand;
```

**Step 3: Create src/commands/language.ts**

```typescript
import { ApplicationCommandOptionType } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import type { Language } from "../i18n/types.js";
import { setGuildLanguage } from "../db/repositories/guildRepo.js";
import { guildStates } from "../music/guildState.js";
import type { JuanitaCommand } from "./types.js";

const VALID_LANGUAGES: Language[] = ["en", "no", "molde"];

export default {
  name: "language",
  description: "Change the bot language for this server",
  options: [
    {
      name: "language",
      description: "Language to use (en, no, molde)",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: VALID_LANGUAGES.map((l) => ({ name: l, value: l })),
    },
  ],

  async execute({ interaction, lang }) {
    const chosen = interaction.options.get("language", true).value as Language;

    await setGuildLanguage(interaction.guildId!, chosen);

    const state = guildStates.get(interaction.guildId!);
    if (state) state.lang = chosen;

    await interaction.reply({
      embeds: [simpleEmbed(`${msg.LANGUAGE_SET[chosen]} \`${chosen}\``, EmbedType.Success)],
      ephemeral: true,
    });
  },
} as JuanitaCommand;
```

**Step 4: Commit**

```bash
git add src/commands/ping.ts src/commands/help.ts src/commands/language.ts
git commit -m "feat: utility commands — ping, help, language"
```

---

### Task 9: Interactive Button & Select Menu Handlers

**Files:**
- Create: `src/interactions/buttons/index.ts`
- Create: `src/interactions/selectMenus/queueSelect.ts`

**Step 1: Create src/interactions/buttons/index.ts**

All button handlers in one file — they're small.

```typescript
import type { ButtonInteraction } from "discord.js";
import type { JuanitaClient } from "../../client.js";
import type { GuildState } from "../../music/guildState.js";
import { simpleEmbed, EmbedType } from "../../embeds/simpleEmbed.js";
import { cleanupQueueEmbed, sendOrUpdateQueueEmbed } from "../../embeds/queueEmbed.js";
import * as msg from "../../i18n/messages.js";

type ButtonHandler = (
  interaction: ButtonInteraction,
  client: JuanitaClient,
  state: GuildState,
) => Promise<void>;

async function handleKys(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player) {
    await interaction.reply({ embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.destroy();
  await cleanupQueueEmbed(state.queueEmbed);
  await interaction.reply({ embeds: [simpleEmbed(`👋 ${msg.KYS_SUCCESS[state.lang]}`, EmbedType.Success)], ephemeral: true });
}

async function handleSkip(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.skip();
  await interaction.deferUpdate();
}

async function handlePause(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.pause(!player.paused);
  await interaction.deferUpdate();
}

async function handleShuffle(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.queue.shuffle();
  await interaction.deferUpdate();
}

async function handlePrevPage(interaction: ButtonInteraction, _client: JuanitaClient, state: GuildState) {
  if (state.queueEmbed.page > 0) state.queueEmbed.page--;
  await interaction.deferUpdate();
}

async function handleNextPage(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player) return;
  const maxPage = Math.ceil([...player.queue].length / 25);
  if (state.queueEmbed.page < maxPage - 1) state.queueEmbed.page++;
  await interaction.deferUpdate();
}

export const buttonHandlers: Record<string, ButtonHandler> = {
  "btn:kys": handleKys,
  "btn:skip": handleSkip,
  "btn:pause": handlePause,
  "btn:shuffle": handleShuffle,
  "btn:prev_page": handlePrevPage,
  "btn:next_page": handleNextPage,
};
```

**Step 2: Create src/interactions/selectMenus/queueSelect.ts**

```typescript
import type { StringSelectMenuInteraction } from "discord.js";
import type { JuanitaClient } from "../../client.js";
import type { GuildState } from "../../music/guildState.js";
import { simpleEmbed, EmbedType } from "../../embeds/simpleEmbed.js";
import * as msg from "../../i18n/messages.js";

export default async function handleQueueSelect(
  interaction: StringSelectMenuInteraction,
  client: JuanitaClient,
  state: GuildState,
) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({
      embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)],
      ephemeral: true,
    });
    return;
  }

  const value = parseInt(interaction.values[0]!);
  if (isNaN(value) || value < 0 || value >= [...player.queue].length) {
    await interaction.reply({
      embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)],
      ephemeral: true,
    });
    return;
  }

  // Remove all tracks before the selected one, then skip current
  player.queue.splice(0, value);
  player.skip();
  state.queueEmbed.page = 0;
  await interaction.deferUpdate();
}
```

**Step 3: Commit**

```bash
git add src/interactions/
git commit -m "feat: button handlers and queue select menu"
```

---

### Task 10: Wire It All Together & Player Events

**Files:**
- Modify: `src/index.ts`
- Modify: `src/client.ts` (if needed)

**Step 1: Update src/index.ts to load commands, register them, set up events**

```typescript
import { config } from "./config.js";
import { JuanitaClient } from "./client.js";
import { registerCommands } from "./core/commandRegistry.js";
import { setupInteractionHandler } from "./core/interactionRouter.js";
import { logPlay } from "./db/repositories/historyRepo.js";
import { getOrCreateGuildState, guildStates } from "./music/guildState.js";
import { sendOrUpdateQueueEmbed, cleanupQueueEmbed } from "./embeds/queueEmbed.js";

const client = new JuanitaClient();

// Lavalink node events
client.kazagumo.shoukaku.on("ready", (name) =>
  console.log(`[Lavalink] Node ${name}: Ready`),
);
client.kazagumo.shoukaku.on("error", (name, error) =>
  console.error(`[Lavalink] Node ${name}: Error`, error),
);
client.kazagumo.shoukaku.on("disconnect", (name) =>
  console.log(`[Lavalink] Node ${name}: Disconnected`),
);

// Kazagumo player events
client.kazagumo.on("playerStart", (player, track) => {
  console.log(`[Player] ${player.guildId}: Playing ${track.title}`);
});

client.kazagumo.on("playerEnd", async (player) => {
  const track = player.queue.previous;
  if (track) {
    try {
      await logPlay({
        guildId: player.guildId,
        title: track.title ?? "Unknown",
        url: track.uri ?? "",
        durationSeconds: track.length ? Math.floor(track.length / 1000) : undefined,
        requestedById: (track.requester as any)?.id ?? "unknown",
        requestedByTag: (track.requester as any)?.tag ?? (track.requester as any)?.user?.tag ?? "Unknown",
      });
    } catch (e) {
      console.error("[DB] Failed to log play:", e);
    }
  }
});

client.kazagumo.on("playerEmpty", async (player) => {
  console.log(`[Player] ${player.guildId}: Queue empty`);
  const state = guildStates.get(player.guildId);
  if (state) await cleanupQueueEmbed(state.queueEmbed);
  player.destroy();
});

// Discord ready — register commands
client.on("ready", async (c) => {
  console.log(`[Bot] Logged in as ${c.user.tag}`);

  const commands = await registerCommands(client);
  console.log(`[Bot] Loaded ${commands.length} commands`);

  // Register slash commands
  if (config.bot.devGuildId) {
    const guild = c.guilds.cache.get(config.bot.devGuildId);
    await guild?.commands.set(commands);
    console.log(`[Bot] Registered commands to dev guild: ${config.bot.devGuildId}`);
  } else {
    await c.application.commands.set(commands);
    console.log("[Bot] Registered commands globally");
  }
});

// Set up interaction handling
setupInteractionHandler(client);

// Login
client.login(config.bot.token);
```

**Step 2: Verify the whole project compiles**

```bash
npx tsc --noEmit
```

Fix any type errors.

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: wire everything together — player events, command registration, full bot lifecycle"
```

---

### Task 11: Copy Sounds & Final Touches

**Files:**
- Move: `src/static/sounds/` → `sounds/`
- Update: `README.md`

**Step 1: Move sound files to top-level sounds/ directory**

```bash
mv src/static/sounds/ sounds/
```

**Step 2: Update README.md with basic setup instructions**

Replace the old README with a concise setup guide: prerequisites (Node.js 22+, Docker), quick start with docker-compose, dev setup, environment variables, command list.

**Step 3: Final commit**

```bash
git add sounds/ README.md
git commit -m "feat: move sounds to top level, update README for revamp"
```

---

### Task 12: End-to-End Smoke Test

**Step 1: Start infrastructure**

```bash
docker compose up -d lavalink postgres
```

**Step 2: Run database migration**

```bash
npx drizzle-kit push
```

**Step 3: Create a .env file with your bot token and start the bot**

```bash
cp .env.example .env
# Edit .env with your BOT_TOKEN
npm run dev
```

**Step 4: Verify in Discord**

- Bot comes online and shows status
- `/ping` responds with latency
- `/help` shows all commands
- `/play <song>` joins voice, plays audio, shows queue embed
- Queue buttons (skip, pause, shuffle, kys) work
- `/language molde` switches to Molde dialect
- Queue select menu jumps to selected track

**Step 5: Commit any fixes from smoke testing**

```bash
git add -A
git commit -m "fix: smoke test fixes"
```
