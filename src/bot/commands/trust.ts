import { Message, VoiceChannel } from "discord.js";
import { ICommand } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER } from "../../utils/messages";
import JuanitaMessage from "../JuanitaMessage";

export default class Trust implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.TRUST;
    this.message = ":kissing_heart: **Okei her kommer jeg** :heart_eyes:";
    this.help =
      "Will make the bot join the voice channel. It will not play anything";
    this.messageDispatcher = new JuanitaMessage();
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel: VoiceChannel = message.member?.voice.channel!;
    if (!botAlreadyJoined(channel)) {
      message.channel.send(this.message);
      channel.join();
    }
  };
}
