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
