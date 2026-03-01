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
