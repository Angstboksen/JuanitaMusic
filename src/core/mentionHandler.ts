import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { config } from "../config.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { buildSystemPrompt } from "../llm/systemPrompts.js";
import { getHistory, pushExchange } from "../llm/conversationCache.js";
import { chatCompletion } from "../llm/openrouter.js";
import * as msg from "../i18n/messages.js";

const MAX_USER_MESSAGE_LENGTH = 500;

export function setupMentionHandler(client: JuanitaClient) {
  client.on("messageCreate", async (message: Message) => {
    // Ignore: no guild, from a bot, LLM not configured, bot not mentioned
    if (!message.guild || message.author.bot) return;
    if (!config.openrouter) return;
    if (!message.mentions.has(client.user!)) return;

    // Strip the bot mention from the message
    const content = message.content
      .replace(new RegExp(`<@!?${client.user!.id}>`, "g"), "")
      .trim();

    if (!content) return; // Empty mention, ignore

    // Truncate to prevent abuse
    const truncated = content.slice(0, MAX_USER_MESSAGE_LENGTH);

    const state = await getOrCreateGuildState(message.guild.id, message.guild.name);

    // Show typing indicator while waiting for LLM (not available on PartialGroupDMChannel)
    if (message.channel.type !== ChannelType.GroupDM) {
      await message.channel.sendTyping();
    }

    const systemPrompt = buildSystemPrompt(state.lang);
    const history = getHistory(message.guild.id, message.author.id);
    const response = await chatCompletion(systemPrompt, history, truncated, msg.LLM_ERROR[state.lang]);

    // Cache the exchange for conversation continuity
    pushExchange(message.guild.id, message.author.id, truncated, response);

    await message.reply(response);
  });
}
