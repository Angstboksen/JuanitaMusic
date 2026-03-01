import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "pause",
  description: "Pause or resume the current song!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    const player = client.getPlayer(interaction.guildId!);
    if (!player?.queue.current) {
      await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[lang], EmbedType.Error)], ephemeral: true });
      return;
    }

    const title = player.queue.current.title;
    const wasPaused = player.paused;

    player.pause(!wasPaused);

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, undefined, client.user?.displayAvatarURL());

    const statusMsg = wasPaused ? msg.RESUME_SUCCESS[lang] : msg.PAUSE_SUCCESS[lang];
    const icon = wasPaused ? "▶️" : "⏸️";

    await interaction.reply({
      embeds: [simpleEmbed(`${icon} \`${title}\` ${statusMsg}`, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
