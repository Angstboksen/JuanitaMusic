import { GuildMember, Message, User, VoiceChannel } from "discord.js";
import SETUP_CONFIG from "../config";
import { CommandEnum } from "./enums";

export const checkPrefixAndSenderNotBot = (
  prefix: string,
  message: Message
): boolean => {
  return message.content.startsWith(prefix) && !message.author.bot;
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
  return member.voice.channel !== null;
};

export const isCommandNameCorrect = (given: string, correct: CommandEnum) => {
  return given.substring(1, given.length) === correct;
};

export const botAlreadyJoined = (channel: VoiceChannel): boolean => {
  for (let user of channel.members) {
    if (user[0] === SETUP_CONFIG.botid) {
      return true;
    }
  }
  return false;
};

export const commandTypes: string[] = Object.values(CommandEnum);

export const formattedTime = (secs: string) => {
  var sec_num = parseInt(secs, 10)
  var hours = Math.floor(sec_num / 3600)
  var minutes = Math.floor(sec_num / 60) % 60
  var seconds = sec_num % 60

  return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
}

export const shuffleArray = (array: Array<any>) => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const a = array[i]
      array[i] = array[j]
      array[j] = a
  }
  return array
}
