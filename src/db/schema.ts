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
