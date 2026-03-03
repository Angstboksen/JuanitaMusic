import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "back",
  description: "Play the previous track!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const previous = player.queue.previous[0];
    if (!previous) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_PREVIOUS_TRACK[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    player.play(previous);

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`⏮️ ${msg.BACK_SUCCESS[lang]} \`${previous.title}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
