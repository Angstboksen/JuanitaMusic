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
