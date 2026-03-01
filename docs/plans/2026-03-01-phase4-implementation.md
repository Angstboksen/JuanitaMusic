# Phase 4: Smart Curation & History Analysis — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add /recommend (LLM-powered), /stats, Auto-DJ (history-based, opt-in toggle), and a recommend tool for @mention chat.

**Architecture:** New history query functions power all features. /stats is pure SQL → embed. /recommend sends top songs to LLM. Auto-DJ hooks into `playerEmpty` event to queue random history tracks instead of disconnecting. A new `autoDj` column on guilds enables per-guild toggle.

**Tech Stack:** Drizzle ORM (SQL aggregations), OpenRouter LLM (for /recommend), Kazagumo (auto-DJ playback), Discord.js embeds

---

### Task 1: Database — History query functions

**Files:**
- Modify: `src/db/repositories/historyRepo.ts`

**Step 1: Add history query functions**

Add these functions to the existing `historyRepo.ts` (after the existing `logPlay` function). These use Drizzle's query builder with raw SQL for aggregations.

```typescript
import { eq, sql, desc } from "drizzle-orm";
// ... existing imports already have: import { db } from "../database.js"; and import { history } from "../schema.js";

// Add after existing logPlay function:

export async function getTopSongs(guildId: string, limit = 5) {
  return db
    .select({
      title: history.title,
      url: history.url,
      playCount: sql<number>`count(*)::int`.as("play_count"),
    })
    .from(history)
    .where(eq(history.guildId, guildId))
    .groupBy(history.title, history.url)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getTopRequesters(guildId: string, limit = 5) {
  return db
    .select({
      tag: history.requestedByTag,
      requestCount: sql<number>`count(*)::int`.as("request_count"),
    })
    .from(history)
    .where(eq(history.guildId, guildId))
    .groupBy(history.requestedByTag)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getGuildStats(guildId: string) {
  const result = await db
    .select({
      totalPlays: sql<number>`count(*)::int`,
      uniqueSongs: sql<number>`count(distinct ${history.url})::int`,
      totalSeconds: sql<number>`coalesce(sum(${history.durationSeconds}), 0)::int`,
    })
    .from(history)
    .where(eq(history.guildId, guildId));
  return result[0] ?? { totalPlays: 0, uniqueSongs: 0, totalSeconds: 0 };
}

export async function getRandomSong(guildId: string): Promise<string | null> {
  const result = await db
    .select({ url: history.url })
    .from(history)
    .where(eq(history.guildId, guildId))
    .orderBy(sql`random()`)
    .limit(1);
  return result[0]?.url ?? null;
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/db/repositories/historyRepo.ts
git commit -m "feat: history query functions for stats, top songs, random song"
```

---

### Task 2: Database — Auto-DJ toggle on guilds

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `src/db/repositories/guildRepo.ts`
- Modify: `src/music/guildState.ts`

**Step 1: Add `autoDj` column to guilds schema**

In `src/db/schema.ts`, add a `boolean` import and the column. Replace the guilds table definition:

```typescript
import { pgTable, text, serial, integer, timestamp, unique, boolean } from "drizzle-orm/pg-core";

export const guilds = pgTable("guilds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  language: text("language").notNull().default("no"),
  autoDj: boolean("auto_dj").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 2: Add guild repo functions for auto-DJ**

Append to `src/db/repositories/guildRepo.ts`:

```typescript
export async function getAutoDj(guildId: string): Promise<boolean> {
  const result = await db.select({ autoDj: guilds.autoDj }).from(guilds).where(eq(guilds.id, guildId)).limit(1);
  return result[0]?.autoDj ?? false;
}

export async function toggleAutoDj(guildId: string): Promise<boolean> {
  const current = await getAutoDj(guildId);
  const newValue = !current;
  await db.update(guilds).set({ autoDj: newValue }).where(eq(guilds.id, guildId));
  return newValue;
}
```

**Step 3: Add `autoDj` to GuildState**

In `src/music/guildState.ts`, add `autoDj: boolean` to the `GuildState` interface and populate it in `getOrCreateGuildState`:

Import `getAutoDj` from guildRepo:

```typescript
import { ensureGuild, getGuildLanguage, getAutoDj } from "../db/repositories/guildRepo.js";
```

Update the interface:

```typescript
export interface GuildState {
  lang: Language;
  queueEmbed: QueueEmbedState;
  autoDj: boolean;
}
```

Update `getOrCreateGuildState` to fetch and store autoDj:

```typescript
export async function getOrCreateGuildState(guildId: string, guildName: string): Promise<GuildState> {
  let state = guildStates.get(guildId);
  if (state) return state;

  await ensureGuild(guildId, guildName);
  const lang = await getGuildLanguage(guildId);
  const autoDj = await getAutoDj(guildId);

  state = {
    lang,
    queueEmbed: createQueueState(),
    autoDj,
  };
  guildStates.set(guildId, state);
  return state;
}
```

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/db/schema.ts src/db/repositories/guildRepo.ts src/music/guildState.ts
git commit -m "feat: auto-dj toggle on guilds table and guild state"
```

---

### Task 3: i18n — Phase 4 messages

**Files:**
- Modify: `src/i18n/messages.ts`

**Step 1: Add Phase 4 i18n strings**

Append to `src/i18n/messages.ts`:

```typescript
// === Phase 4: Smart curation ===

export const AUTODJ_ENABLED: LocalizedString = {
  en: "Auto-DJ enabled! I'll keep playing when the queue runs out.",
  no: "Auto-DJ aktivert! Jeg spiller videre når køen er tom.",
  molde: "AUTO-DJ AKTIVERT! I SPILLE VIDERE NÅR KØA E TOM!",
};

export const AUTODJ_DISABLED: LocalizedString = {
  en: "Auto-DJ disabled.",
  no: "Auto-DJ deaktivert.",
  molde: "AUTO-DJ DEAKTIVERT!",
};

export const AUTODJ_NO_HISTORY: LocalizedString = {
  en: "No listening history yet — play some songs first!",
  no: "Ingen lyttehistorikk ennå — spill noen sanger først!",
  molde: "INGEN HISTORIKK ENNÅ! SPILL NOKKA SANGA FØRST DA MONGO!",
};

export const RECOMMEND_TITLE: LocalizedString = {
  en: "Recommendations based on your taste",
  no: "Anbefalinger basert på smaken din",
  molde: "ANBEFALINGA BASERT PÅ SMAKEN DANSEN",
};

export const RECOMMEND_NO_HISTORY: LocalizedString = {
  en: "Not enough listening history to make recommendations. Play more songs!",
  no: "Ikke nok lyttehistorikk for anbefalinger. Spill flere sanger!",
  molde: "IKKJE NOK HISTORIKK FOR ANBEFALINGA! SPILL MEIR MUSIKK DA!",
};

export const STATS_TITLE: LocalizedString = {
  en: "Server Music Stats",
  no: "Server musikkstatistikk",
  molde: "SERVER MUSIKKSTATISTIKK",
};

export const STATS_TOP_SONGS: LocalizedString = {
  en: "Top Songs",
  no: "Topp sanger",
  molde: "TOPP SANGA",
};

export const STATS_TOP_USERS: LocalizedString = {
  en: "Top DJs",
  no: "Topp DJer",
  molde: "TOPP DJSA",
};

export const STATS_OVERVIEW: LocalizedString = {
  en: "Overview",
  no: "Oversikt",
  molde: "OVERSIKT",
};

export const STATS_NO_HISTORY: LocalizedString = {
  en: "No listening history yet!",
  no: "Ingen lyttehistorikk ennå!",
  molde: "INGEN HISTORIKK ENNÅ!",
};
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/i18n/messages.ts
git commit -m "feat: Phase 4 i18n strings for autodj, recommend, stats"
```

---

### Task 4: `/stats` command + embed

**Files:**
- Create: `src/embeds/statsEmbed.ts`
- Create: `src/commands/stats.ts`

**Step 1: Create `src/embeds/statsEmbed.ts`**

```typescript
import { EmbedBuilder } from "discord.js";
import type { Language } from "../i18n/types.js";
import * as msg from "../i18n/messages.js";
import { millisecondsToTime } from "../utils/time.js";

interface StatsData {
  topSongs: { title: string; playCount: number }[];
  topRequesters: { tag: string; requestCount: number }[];
  totalPlays: number;
  uniqueSongs: number;
  totalSeconds: number;
}

export function buildStatsEmbed(data: StatsData, lang: Language, guildName: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`📊 ${msg.STATS_TITLE[lang]}`);

  // Overview
  const totalTime = millisecondsToTime(data.totalSeconds * 1000);
  embed.addFields({
    name: msg.STATS_OVERVIEW[lang],
    value: `🎵 **${data.totalPlays}** plays · **${data.uniqueSongs}** unique songs · **${totalTime}** total`,
    inline: false,
  });

  // Top songs
  if (data.topSongs.length > 0) {
    const songLines = data.topSongs
      .map((s, i) => `\`${i + 1}.\` ${s.title.slice(0, 40)} — **${s.playCount}** plays`)
      .join("\n");
    embed.addFields({ name: `🏆 ${msg.STATS_TOP_SONGS[lang]}`, value: songLines, inline: false });
  }

  // Top users
  if (data.topRequesters.length > 0) {
    const userLines = data.topRequesters
      .map((u, i) => `\`${i + 1}.\` ${u.tag} — **${u.requestCount}** requests`)
      .join("\n");
    embed.addFields({ name: `🎧 ${msg.STATS_TOP_USERS[lang]}`, value: userLines, inline: false });
  }

  return embed;
}
```

**Step 2: Create `src/commands/stats.ts`**

```typescript
import * as msg from "../i18n/messages.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { buildStatsEmbed } from "../embeds/statsEmbed.js";
import { getTopSongs, getTopRequesters, getGuildStats } from "../db/repositories/historyRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "stats",
  description: "Show this server's music listening stats!",

  async execute({ interaction, lang }) {
    await interaction.deferReply();

    const guildId = interaction.guildId!;
    const stats = await getGuildStats(guildId);

    if (stats.totalPlays === 0) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.STATS_NO_HISTORY[lang], EmbedType.Info)],
      });
      return;
    }

    const [topSongs, topRequesters] = await Promise.all([
      getTopSongs(guildId, 5),
      getTopRequesters(guildId, 5),
    ]);

    const embed = buildStatsEmbed(
      {
        topSongs: topSongs.map((s) => ({ title: s.title, playCount: s.playCount })),
        topRequesters: topRequesters.map((u) => ({ tag: u.tag, requestCount: u.requestCount })),
        totalPlays: stats.totalPlays,
        uniqueSongs: stats.uniqueSongs,
        totalSeconds: stats.totalSeconds,
      },
      lang,
      interaction.guild!.name,
    );

    await interaction.editReply({ embeds: [embed] });
  },
} as JuanitaCommand;
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/embeds/statsEmbed.ts src/commands/stats.ts
git commit -m "feat: /stats command with top songs, top DJs, and overview"
```

---

### Task 5: `/recommend` command

**Files:**
- Create: `src/commands/recommend.ts`

**Step 1: Create `src/commands/recommend.ts`**

This command queries top songs, sends them to the LLM, and returns recommendations. It also passes tool context so the LLM can queue a recommended song if asked.

```typescript
import { GuildMember, type TextChannel } from "discord.js";
import * as msg from "../i18n/messages.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { getTopSongs } from "../db/repositories/historyRepo.js";
import { buildSystemPrompt } from "../llm/systemPrompts.js";
import { chatCompletion } from "../llm/openrouter.js";
import { config } from "../config.js";
import type { ToolContext } from "../llm/tools.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "recommend",
  description: "Get song recommendations based on this server's listening history!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    await interaction.deferReply();

    if (!config.openrouter) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.LLM_NOT_CONFIGURED[lang], EmbedType.Error)],
      });
      return;
    }

    const guildId = interaction.guildId!;
    const topSongs = await getTopSongs(guildId, 20);

    if (topSongs.length < 3) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.RECOMMEND_NO_HISTORY[lang], EmbedType.Info)],
      });
      return;
    }

    const songList = topSongs
      .map((s, i) => `${i + 1}. ${s.title} (${s.playCount} plays)`)
      .join("\n");

    const systemPrompt = buildSystemPrompt(lang);
    const userMessage = `Here are this server's most played songs:\n${songList}\n\nBased on this taste, recommend 3-5 songs they would enjoy. Be specific with artist and song names.`;

    const member = interaction.member as GuildMember;
    const toolContext: ToolContext = {
      client,
      guildId,
      member,
      textChannel: interaction.channel as TextChannel,
      lang,
    };

    const response = await chatCompletion(systemPrompt, [], userMessage, msg.LLM_ERROR[lang], toolContext);

    await interaction.editReply({ content: response });
  },
} as JuanitaCommand;
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/commands/recommend.ts
git commit -m "feat: /recommend command with LLM-powered suggestions"
```

---

### Task 6: `/autodj` command

**Files:**
- Create: `src/commands/autodj.ts`

**Step 1: Create `src/commands/autodj.ts`**

```typescript
import * as msg from "../i18n/messages.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { toggleAutoDj } from "../db/repositories/guildRepo.js";
import { guildStates } from "../music/guildState.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "autodj",
  description: "Toggle Auto-DJ — keeps playing from history when the queue runs out!",

  async execute({ interaction, lang }) {
    const guildId = interaction.guildId!;
    const newValue = await toggleAutoDj(guildId);

    // Update in-memory state
    const state = guildStates.get(guildId);
    if (state) state.autoDj = newValue;

    const message = newValue ? msg.AUTODJ_ENABLED[lang] : msg.AUTODJ_DISABLED[lang];
    await interaction.reply({
      embeds: [simpleEmbed(`🎶 ${message}`, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/commands/autodj.ts
git commit -m "feat: /autodj toggle command"
```

---

### Task 7: Auto-DJ in playerEmpty event

**Files:**
- Modify: `src/index.ts`

**Step 1: Update the `playerEmpty` handler in `src/index.ts`**

Currently, `playerEmpty` cleans up and destroys. Change it to check auto-dj first and queue a random song if enabled.

Replace the existing `playerEmpty` handler with:

```typescript
client.kazagumo.on("playerEmpty", async (player) => {
  console.log(`[Player] ${player.guildId}: Queue empty`);
  const state = guildStates.get(player.guildId);

  // Auto-DJ: queue a random song from history instead of disconnecting
  if (state?.autoDj) {
    try {
      const { getRandomSong } = await import("./db/repositories/historyRepo.js");
      const url = await getRandomSong(player.guildId);
      if (url) {
        const result = await client.kazagumo.search(url, { requester: client.user });
        if (result.tracks.length > 0) {
          player.queue.add(result.tracks[0]!);
          player.play();
          console.log(`[Auto-DJ] ${player.guildId}: Queued ${result.tracks[0]!.title}`);

          const { sendOrUpdateQueueEmbed } = await import("./embeds/queueEmbed.js");
          sendOrUpdateQueueEmbed(state.queueEmbed, player, state.lang, undefined, client.user?.displayAvatarURL());
          return;
        }
      }
    } catch (e) {
      console.error("[Auto-DJ] Failed to queue random song:", e);
    }
  }

  // Default: cleanup and disconnect
  if (state) await cleanupQueueEmbed(state.queueEmbed);
  player.destroy();
});
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: auto-dj queues random history song on empty queue"
```

---

### Task 8: LLM `recommend` tool

**Files:**
- Modify: `src/llm/tools.ts`

**Step 1: Add `recommend` tool schema and executor**

In `src/llm/tools.ts`:

Add to the `TOOL_SCHEMAS` array (after the `seek` tool):

```typescript
  {
    type: "function",
    function: {
      name: "recommend",
      description: "Get song recommendations based on this server's listening history. Use when users ask for recommendations or suggestions.",
      parameters: { type: "object", properties: {} },
    },
  },
```

Add a new case in the `executeTool` switch statement (before the `default` case):

```typescript
    case "recommend": {
      const { getTopSongs } = await import("../db/repositories/historyRepo.js");
      const topSongs = await getTopSongs(guildId, 20);
      if (topSongs.length < 3) return "Not enough listening history to make recommendations. The server needs to play more songs first.";
      const songList = topSongs
        .map((s, i) => `${i + 1}. ${s.title} (${s.playCount} plays)`)
        .join("\n");
      return `Here are this server's most played songs:\n${songList}\n\nUse this data to recommend new songs. If they want you to play one, use the play_song tool.`;
    }
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/llm/tools.ts
git commit -m "feat: LLM recommend tool for @mention recommendations"
```

---

### Task 9: Database migration for auto_dj column

**Files:**
- Run drizzle migration

**Step 1: Generate migration**

Run: `npx drizzle-kit generate`

This should create a migration that adds the `auto_dj` boolean column to the `guilds` table.

**Step 2: Run migration**

Run: `npx drizzle-kit push` (or `npx drizzle-kit migrate` depending on the setup)

Note: If the database is not running locally, this step can be done at deploy time. The column has a default value of `false` so it's safe.

**Step 3: Commit migration files**

```bash
git add drizzle/
git commit -m "feat: migration for auto_dj column on guilds"
```

---

### Task 10: Type check & smoke test

**Files:** None (verification only)

**Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Verify new commands exist**

The `src/commands/` directory should now include:
- `stats.ts`
- `recommend.ts`
- `autodj.ts`

**Step 3: Verify new embed exists**

`src/embeds/statsEmbed.ts` should exist.

**Step 4: Verify history repo has all query functions**

`src/db/repositories/historyRepo.ts` should export:
- `logPlay` (existing)
- `getTopSongs`
- `getTopRequesters`
- `getGuildStats`
- `getRandomSong`

Done! Phase 4 is complete.
