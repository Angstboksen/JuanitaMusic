import { Message, VoiceChannel, VoiceConnection } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER } from "../../utils/messages";
import JuanitaMessage from "../JuanitaMessage";

export default class Cum implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.CUM;
    this.message = ":kissing_heart: **Okei her kommer jeg** :heart_eyes:";
    this.help =
      "Will make the bot join the voice channel. It will not play anything";
    this.messageDispatcher = new JuanitaMessage();
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (
    message: Message,
    guild: IGuild
  ): Promise<VoiceConnection | undefined> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const voiceChannel: VoiceChannel = message.member?.voice.channel!;
    if (!botAlreadyJoined(voiceChannel)) {
      this.messageDispatcher.send(message.channel, this.message);
      guild.connection = await voiceChannel.join();
      return guild.connection;
    }
    return guild.connection;
  };
}
