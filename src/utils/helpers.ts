import { GuildMember, Message, User } from "discord.js";
import { CommandEnum } from "./enums";

export const checkPrefixAndSenderNotBot = (
  prefix: string,
  message: Message
): boolean => {
  return message.content.startsWith(prefix) && !message.author.bot
};

export const tokenize = (content: string): string[] => {
  return content.split(" ");
};

export const isValidCommand = (command: string): boolean => {
  return Object.values(CommandEnum).includes(
    command.substring(1, command.length) as CommandEnum
  );
};

export const userInVoiceChannel = (member: GuildMember): boolean => {
    return member.voice.channel !== null
}

export const commandTypes: string[] = Object.values(CommandEnum);
