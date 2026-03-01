import { eq, sql, desc } from "drizzle-orm";
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
