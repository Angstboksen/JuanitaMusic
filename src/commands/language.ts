import { ApplicationCommandOptionType } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import type { Language } from "../i18n/types.js";
import { setGuildLanguage } from "../db/repositories/guildRepo.js";
import { guildStates } from "../music/guildState.js";
import type { JuanitaCommand } from "./types.js";

const VALID_LANGUAGES: Language[] = ["en", "no", "molde"];

export default {
  name: "language",
  description: "Change the bot language for this server",
  options: [
    {
      name: "language",
      description: "Language to use (en, no, molde)",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: VALID_LANGUAGES.map((l) => ({ name: l, value: l })),
    },
  ],

  async execute({ interaction, lang }) {
    const chosen = interaction.options.get("language", true).value as Language;

    await setGuildLanguage(interaction.guildId!, chosen);

    const state = guildStates.get(interaction.guildId!);
    if (state) state.lang = chosen;

    await interaction.reply({
      embeds: [simpleEmbed(`${msg.LANGUAGE_SET[chosen]} \`${chosen}\``, EmbedType.Success)],
      ephemeral: true,
    });
  },
} as JuanitaCommand;
