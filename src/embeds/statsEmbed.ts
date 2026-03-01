import { EmbedBuilder } from "discord.js";
import type { Language } from "../i18n/types.js";
import * as msg from "../i18n/messages.js";
import { millisecondsToTime } from "../utils/time.js";

interface StatsData {
  topSongs: { title: string; playCount: number }[];
  topRequesters: { tag: string; requestCount: number }[];
  totalPlays: number;
  uniqueSongs: number;
  totalSeconds: number;
}

export function buildStatsEmbed(data: StatsData, lang: Language, guildName: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`📊 ${msg.STATS_TITLE[lang]}`);

  // Overview
  const totalTime = millisecondsToTime(data.totalSeconds * 1000);
  embed.addFields({
    name: msg.STATS_OVERVIEW[lang],
    value: `🎵 **${data.totalPlays}** plays · **${data.uniqueSongs}** unique songs · **${totalTime}** total`,
    inline: false,
  });

  // Top songs
  if (data.topSongs.length > 0) {
    const songLines = data.topSongs
      .map((s, i) => `\`${i + 1}.\` ${s.title.slice(0, 40)} — **${s.playCount}** plays`)
      .join("\n");
    embed.addFields({ name: `🏆 ${msg.STATS_TOP_SONGS[lang]}`, value: songLines, inline: false });
  }

  // Top users
  if (data.topRequesters.length > 0) {
    const userLines = data.topRequesters
      .map((u, i) => `\`${i + 1}.\` ${u.tag} — **${u.requestCount}** requests`)
      .join("\n");
    embed.addFields({ name: `🎧 ${msg.STATS_TOP_USERS[lang]}`, value: userLines, inline: false });
  }

  return embed;
}
