import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "shuffle",
  description: "Shuffle the current queue!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const tracks = [...player.queue];
    if (tracks.length === 0) {
      await interaction.reply({ embeds: [simpleEmbed(msg.EMPTY_QUEUE[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    player.queue.shuffle();

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`🔀 ${msg.SHUFFLE_SUCCESS[lang]}`, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
