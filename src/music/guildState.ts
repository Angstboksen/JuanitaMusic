import type { Language } from "../i18n/types.js";
import { ensureGuild, getGuildLanguage, getAutoDj, getVoiceEnabled } from "../db/repositories/guildRepo.js";
import { createQueueState, type QueueEmbedState } from "../embeds/queueEmbed.js";

export interface GuildState {
  lang: Language;
  queueEmbed: QueueEmbedState;
  autoDj: boolean;
  voiceEnabled: boolean;
}

export const guildStates = new Map<string, GuildState>();

export async function getOrCreateGuildState(guildId: string, guildName: string): Promise<GuildState> {
  let state = guildStates.get(guildId);
  if (state) return state;

  await ensureGuild(guildId, guildName);
  const lang = await getGuildLanguage(guildId);
  const autoDj = await getAutoDj(guildId);
  const voiceEnabled = await getVoiceEnabled(guildId);

  state = {
    lang,
    queueEmbed: createQueueState(),
    autoDj,
    voiceEnabled,
  };
  guildStates.set(guildId, state);
  return state;
}
