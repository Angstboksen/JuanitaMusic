import { ApplicationCommandOptionType } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "jump",
  description: "Jump to a specific position in the queue!",
  voiceChannel: true,
  options: [
    {
      name: "position",
      description: "The queue position to jump to (1-based)",
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

    const targetTrack = tracks[position - 1]!;

    // Remove all tracks before the target position
    if (position > 1) {
      player.queue.splice(0, position - 1);
    }

    player.skip();

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`⏩ ${msg.JUMP_SUCCESS[lang]} \`${targetTrack.title}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
