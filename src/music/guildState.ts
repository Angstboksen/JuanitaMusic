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
