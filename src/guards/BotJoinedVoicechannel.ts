import { GuardFunction } from "@typeit/discord";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { createInfoEmbed } from "../utils/helpers";

export const BotJoinedVoiceChannel: GuardFunction<"message"> = async (
  [message],
  client,
  next
) => {
  const connection = message.guild?.voice?.connection;
  if (!connection) {
    const guild = GuildCommander.get(message.guild!);
    guild.clear();
    await message.member?.voice.channel?.join();
  }
  next();
};
