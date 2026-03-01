import { ApplicationCommandOptionType } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "remove",
  description: "Remove a song from the queue by its position!",
  voiceChannel: true,
  options: [
    {
      name: "position",
      description: "The queue position of the song to remove (1-based)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
    },
  ],

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const tracks = [...player.queue];
    const position = interaction.options.get("position", true).value as number;

    if (position < 1 || position > tracks.length) {
      await interaction.reply({
        embeds: [simpleEmbed(`${msg.INVALID_POSITION[lang]} \`1 - ${tracks.length}\``, EmbedType.Error)],
        ephemeral: true,
      });
      return;
    }

    const removedTrack = tracks[position - 1]!;
    player.queue.splice(position - 1, 1);

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`🗑️ ${msg.REMOVE_SUCCESS[lang]} \`${removedTrack.title}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
