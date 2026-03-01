import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "skip",
  description: "Skip to the next song in the queue!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const from = player.queue.current.title;
    const tracks = [...player.queue];
    const to = tracks.length > 0 ? tracks[0]!.title : msg.EMPTY_QUEUE[lang];

    player.skip();

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    await interaction.reply({
      embeds: [simpleEmbed(`⏭️ ${msg.SKIP_FROM[lang]} \`${from}\`\n🎶 ${msg.SKIP_TO[lang]} \`${to}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
