import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { cleanupQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "kys",
  description: "Disconnect the bot and clear the queue!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    await cleanupQueueEmbed(state.queueEmbed);

    player.destroy();

    await interaction.reply({
      embeds: [simpleEmbed(`💀 ${msg.KYS_SUCCESS[lang]}`, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
