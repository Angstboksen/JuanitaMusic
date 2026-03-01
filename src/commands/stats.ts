import * as msg from "../i18n/messages.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { buildStatsEmbed } from "../embeds/statsEmbed.js";
import { getTopSongs, getTopRequesters, getGuildStats } from "../db/repositories/historyRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "stats",
  description: "Show this server's music listening stats!",

  async execute({ interaction, lang }) {
    await interaction.deferReply();

    const guildId = interaction.guildId!;
    const stats = await getGuildStats(guildId);

    if (stats.totalPlays === 0) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.STATS_NO_HISTORY[lang], EmbedType.Info)],
      });
      return;
    }

    const [topSongs, topRequesters] = await Promise.all([
      getTopSongs(guildId, 5),
      getTopRequesters(guildId, 5),
    ]);

    const embed = buildStatsEmbed(
      {
        topSongs: topSongs.map((s) => ({ title: s.title, playCount: s.playCount })),
        topRequesters: topRequesters.map((u) => ({ tag: u.tag, requestCount: u.requestCount })),
        totalPlays: stats.totalPlays,
        uniqueSongs: stats.uniqueSongs,
        totalSeconds: stats.totalSeconds,
      },
      lang,
      interaction.guild!.name,
    );

    await interaction.editReply({ embeds: [embed] });
  },
} as JuanitaCommand;
