# Phase 2: Spotify + Alias System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Spotify URL support to `/play` via LavaSrc Lavalink plugin, and implement a per-guild alias system for saving/recalling playlist URLs.

**Architecture:** LavaSrc plugin handles Spotify → YouTube resolution server-side in Lavalink. No changes needed in the bot's search logic — Kazagumo returns results the same way. The alias system adds a `/alias` command with subcommands and a pre-search lookup in `/play` and `/first`.

**Tech Stack:** LavaSrc 4.8.1 (Lavalink plugin), Drizzle ORM (alias CRUD), Discord.js subcommands

---

### Task 1: LavaSrc Plugin Configuration

**Files:**
- Modify: `lavalink/application.yml`
- Modify: `.env.example`

**Step 1: Add LavaSrc plugin and Spotify config to lavalink/application.yml**

Add the LavaSrc dependency to the `lavalink.plugins` array, and add a `plugins.lavasrc` config block:

```yaml
lavalink:
  plugins:
    - dependency: "dev.lavalink.youtube:youtube-plugin:1.18.0"
      snapshot: false
    - dependency: "com.github.topi314.lavasrc:lavasrc-plugin:4.8.1"
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
```

Add after the existing `plugins.youtube` block:

```yaml
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
  lavasrc:
    providers:
      - "ytsearch:\"%ISRC%\""
      - "ytsearch:%QUERY%"
    sources:
      spotify: true
      applemusic: false
      deezer: false
      yandexmusic: false
      flowerytts: false
      vkmusic: false
    spotify:
      clientId: "${SPOTIFY_CLIENT_ID}"
      clientSecret: "${SPOTIFY_CLIENT_SECRET}"
      countryCode: "US"
      playlistLoadLimit: 6
      albumLoadLimit: 6
```

The `providers` array tells LavaSrc how to resolve Spotify tracks — first try ISRC match on YouTube, then fall back to text search.

The `${SPOTIFY_CLIENT_ID}` syntax uses Lavalink's environment variable interpolation.

**Step 2: Add Spotify env vars to .env.example**

Append to `.env.example`:

```env
# Spotify (optional — needed for Spotify URL support)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

**Step 3: Add Spotify env vars to docker-compose.yml**

In `docker-compose.yml`, add the Spotify env vars to the `lavalink` service so they're available for the `${...}` interpolation in `application.yml`:

```yaml
  lavalink:
    image: ghcr.io/lavalink-devs/lavalink:4-alpine
    volumes:
      - ./lavalink/application.yml:/opt/Lavalink/application.yml
    ports:
      - "2333:2333"
    environment:
      - _JAVA_OPTIONS=-Xmx1G
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
    restart: unless-stopped
```

**Step 4: Commit**

```bash
git add lavalink/application.yml .env.example docker-compose.yml
git commit -m "feat: add LavaSrc plugin for Spotify support in Lavalink"
```

---

### Task 2: Alias Repository

**Files:**
- Create: `src/db/repositories/aliasRepo.ts`

**Step 1: Create the alias repository**

```typescript
import { eq, and } from "drizzle-orm";
import { db } from "../database.js";
import { aliases } from "../schema.js";

export async function saveAlias(guildId: string, alias: string, url: string) {
  await db
    .insert(aliases)
    .values({ guildId, alias: alias.toLowerCase(), playlistId: url })
    .onConflictDoUpdate({
      target: [aliases.guildId, aliases.alias],
      set: { playlistId: url },
    });
}

export async function getAlias(guildId: string, alias: string) {
  const result = await db
    .select()
    .from(aliases)
    .where(and(eq(aliases.guildId, guildId), eq(aliases.alias, alias.toLowerCase())))
    .limit(1);
  return result[0] ?? null;
}

export async function listAliases(guildId: string) {
  return db
    .select()
    .from(aliases)
    .where(eq(aliases.guildId, guildId))
    .orderBy(aliases.alias);
}

export async function deleteAlias(guildId: string, alias: string) {
  const result = await db
    .delete(aliases)
    .where(and(eq(aliases.guildId, guildId), eq(aliases.alias, alias.toLowerCase())))
    .returning();
  return result.length > 0;
}
```

**Step 2: Commit**

```bash
git add src/db/repositories/aliasRepo.ts
git commit -m "feat: alias repository with save, get, list, delete"
```

---

### Task 3: Alias i18n Strings

**Files:**
- Modify: `src/i18n/messages.ts`

**Step 1: Add alias-related i18n strings at the end of messages.ts**

Append before the closing of the file:

```typescript
// === Alias messages ===

export const ALIAS_SAVED: LocalizedString = {
  en: "Alias saved!",
  no: "Alias lagret!",
  molde: "ALIAS LAGRA!",
};

export const ALIAS_DELETED: LocalizedString = {
  en: "Alias deleted!",
  no: "Alias slettet!",
  molde: "ALIAS SLETTA!",
};

export const ALIAS_NOT_FOUND: LocalizedString = {
  en: "Alias not found!",
  no: "Alias ikke funnet!",
  molde: "FANT IKKJE ALIASET DANSEN!",
};

export const ALIAS_LIST_EMPTY: LocalizedString = {
  en: "No aliases saved for this server.",
  no: "Ingen alias lagret for denne serveren.",
  molde: "INGEN ALIAS LAGRA FOR DENNA SERVEREN!",
};

export const ALIAS_LIST_TITLE: LocalizedString = {
  en: "Saved aliases",
  no: "Lagrede alias",
  molde: "LAGRA ALIAS",
};
```

**Step 2: Commit**

```bash
git add src/i18n/messages.ts
git commit -m "feat: alias i18n strings for en/no/molde"
```

---

### Task 4: Alias Command

**Files:**
- Create: `src/commands/alias.ts`

**Step 1: Create the /alias command with save/list/delete subcommands**

```typescript
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { saveAlias, listAliases, deleteAlias } from "../db/repositories/aliasRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "alias",
  description: "Manage playlist aliases for this server",
  options: [
    {
      name: "save",
      description: "Save a URL under an alias name",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Alias name (e.g. gym-playlist)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "url",
          description: "Playlist or track URL (Spotify, YouTube, SoundCloud, etc.)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "List all saved aliases for this server",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "delete",
      description: "Delete a saved alias",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Alias name to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],

  async execute({ interaction, lang }) {
    const sub = interaction.options.getSubcommand();

    if (sub === "save") {
      const name = interaction.options.getString("name", true);
      const url = interaction.options.getString("url", true);
      await saveAlias(interaction.guildId!, name, url);
      await interaction.reply({
        embeds: [simpleEmbed(`${msg.ALIAS_SAVED[lang]} \`${name}\` → \`${url}\``, EmbedType.Success)],
        ephemeral: true,
      });
      return;
    }

    if (sub === "list") {
      const aliasList = await listAliases(interaction.guildId!);
      if (aliasList.length === 0) {
        await interaction.reply({
          embeds: [simpleEmbed(msg.ALIAS_LIST_EMPTY[lang], EmbedType.Info)],
          ephemeral: true,
        });
        return;
      }

      const lines = aliasList.map((a) => `**${a.alias}** → \`${a.playlistId}\``).join("\n");
      const embed = new EmbedBuilder()
        .setColor("#0000ff")
        .setTitle(msg.ALIAS_LIST_TITLE[lang])
        .setDescription(lines);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === "delete") {
      const name = interaction.options.getString("name", true);
      const deleted = await deleteAlias(interaction.guildId!, name);
      if (!deleted) {
        await interaction.reply({
          embeds: [simpleEmbed(`${msg.ALIAS_NOT_FOUND[lang]} \`${name}\``, EmbedType.Error)],
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        embeds: [simpleEmbed(`${msg.ALIAS_DELETED[lang]} \`${name}\``, EmbedType.Success)],
        ephemeral: true,
      });
    }
  },
} as JuanitaCommand;
```

**Step 2: Commit**

```bash
git add src/commands/alias.ts
git commit -m "feat: /alias command with save, list, delete subcommands"
```

---

### Task 5: Alias Lookup in /play and /first

**Files:**
- Modify: `src/commands/play.ts`
- Modify: `src/commands/first.ts`

**Step 1: Add alias resolution to play.ts**

Add import at the top of `src/commands/play.ts`:

```typescript
import { getAlias } from "../db/repositories/aliasRepo.js";
```

After the line `const query = interaction.options.get("song", true).value as string;`, add alias resolution:

```typescript
    // Resolve alias if it matches
    const alias = await getAlias(interaction.guildId!, query);
    const searchQuery = alias ? alias.playlistId : query;
```

Then change the search call to use `searchQuery` instead of `query`:

```typescript
    const result = await client.kazagumo.search(searchQuery, { requester: member });
```

And update the error message to show the original query:

```typescript
    if (!result.tracks.length) {
      await interaction.editReply({
        embeds: [simpleEmbed(`${msg.NO_RESULTS[lang]} \`${query}\``, EmbedType.Error)],
      });
      return;
    }
```

**Step 2: Add the same alias resolution to first.ts**

Identical changes: add `getAlias` import, resolve alias after getting query, use `searchQuery` in the search call.

**Step 3: Update command descriptions**

In `play.ts`, update the song option description:

```typescript
      description: "Song name, URL, or saved alias",
```

In `first.ts`, same change:

```typescript
      description: "Song name, URL, or saved alias",
```

**Step 4: Commit**

```bash
git add src/commands/play.ts src/commands/first.ts
git commit -m "feat: alias resolution in /play and /first commands"
```

---

### Task 6: Type Check & Final Verification

**Step 1: Run TypeScript compiler**

```bash
npx tsc --noEmit
```

Fix any type errors.

**Step 2: Commit any fixes**

```bash
git add -A
git commit -m "fix: phase 2 type fixes"
```
