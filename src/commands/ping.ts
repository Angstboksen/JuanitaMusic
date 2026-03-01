import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "ping",
  description: "Check bot latency",

  async execute({ interaction, client }) {
    await interaction.reply({
      embeds: [simpleEmbed(`Pong! \`${client.ws.ping}ms\``, EmbedType.Info)],
      ephemeral: true,
    });
  },
} as JuanitaCommand;
