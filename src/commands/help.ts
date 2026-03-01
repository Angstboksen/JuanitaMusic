import { EmbedBuilder } from "discord.js";
import * as msg from "../i18n/messages.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "help",
  description: "List all available commands",

  async execute({ interaction, client, lang }) {
    const commands = [...client.commands.values()];
    const embed = new EmbedBuilder()
      .setColor("#0000ff")
      .setDescription(msg.HELP_DESCRIPTION[lang])
      .addFields(
        commands.map((cmd) => ({
          name: `/${cmd.name}`,
          value: cmd.description,
          inline: true,
        })),
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
} as JuanitaCommand;
