import type { Language } from "../i18n/types.js";
import { ensureGuild, getGuildLanguage, getAutoDj } from "../db/repositories/guildRepo.js";
import { createQueueState, type QueueEmbedState } from "../embeds/queueEmbed.js";

export interface GuildState {
  lang: Language;
  queueEmbed: QueueEmbedState;
  autoDj: boolean;
}

export const guildStates = new Map<string, GuildState>();

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
