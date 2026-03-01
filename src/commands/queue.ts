import { TextChannel } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed, startQueueInterval } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "queue",
  description: "Show the current music queue!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    const channel = interaction.channel as TextChannel;

    startQueueInterval(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`📋 ${msg.QUEUE_SENDING[lang]}`, EmbedType.Info)],
      ephemeral: true,
    });
  },
} as JuanitaCommand;
