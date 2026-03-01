import { ApplicationCommandOptionType } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { millisecondsToTime } from "../utils/time.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "seek",
  description: "Seek to a specific time in the current song!",
  voiceChannel: true,
  options: [
    {
      name: "seconds",
      description: "The time in seconds to seek to",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 0,
    },
  ],

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const seconds = interaction.options.get("seconds", true).value as number;
    const durationMs = player.queue.current.length ?? 0;

    if (seconds * 1000 > durationMs) {
      await interaction.reply({
        embeds: [simpleEmbed(msg.INVALID_SEEK_TIME[lang], EmbedType.Error)],
        ephemeral: true,
      });
      return;
    }

    player.shoukaku.seekTo(seconds * 1000);

    await interaction.reply({
      embeds: [simpleEmbed(`⏱️ ${msg.SEEK_SUCCESS[lang]} \`${millisecondsToTime(seconds * 1000)}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
