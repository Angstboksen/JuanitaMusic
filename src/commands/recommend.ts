import { GuildMember, type TextChannel } from "discord.js";
import * as msg from "../i18n/messages.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { getTopSongs } from "../db/repositories/historyRepo.js";
import { buildSystemPrompt } from "../llm/systemPrompts.js";
import { chatCompletion } from "../llm/openrouter.js";
import { config } from "../config.js";
import type { ToolContext } from "../llm/tools.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "recommend",
  description: "Get song recommendations based on this server's listening history!",
  voiceChannel: true,

  async execute({ interaction, client, lang }) {
    await interaction.deferReply();

    if (!config.openrouter) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.LLM_NOT_CONFIGURED[lang], EmbedType.Error)],
      });
      return;
    }

    const guildId = interaction.guildId!;
    const topSongs = await getTopSongs(guildId, 20);

    if (topSongs.length < 3) {
      await interaction.editReply({
        embeds: [simpleEmbed(msg.RECOMMEND_NO_HISTORY[lang], EmbedType.Info)],
      });
      return;
    }

    const songList = topSongs
      .map((s, i) => `${i + 1}. ${s.title} (${s.playCount} plays)`)
      .join("\n");

    const systemPrompt = buildSystemPrompt(lang);
    const userMessage = `Here are this server's most played songs:\n${songList}\n\nBased on this taste, recommend 3-5 songs they would enjoy. Be specific with artist and song names.`;

    const member = interaction.member as GuildMember;
    const toolContext: ToolContext = {
      client,
      guildId,
      member,
      textChannel: interaction.channel as TextChannel,
      lang,
    };

    const response = await chatCompletion(systemPrompt, [], userMessage, msg.LLM_ERROR[lang], toolContext);

    await interaction.editReply({ content: response });
  },
} as JuanitaCommand;
