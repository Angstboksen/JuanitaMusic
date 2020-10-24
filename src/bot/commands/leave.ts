import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER } from "../../utils/messages";
import JuanitaMessage from "../JuanitaMessage";

export default class Leave implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.LEAVE;
    this.message =
      ":x: **Aight Imma head out!** :disappointed_relieved: :zipper_mouth:";
    this.help = "Will kick the bot from the voice channel";
    this.messageDispatcher = new JuanitaMessage();
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel: VoiceChannel = message.member?.voice.channel!;
    if (botAlreadyJoined(channel)) {
      this.messageDispatcher.send(message.channel, this.message);
      channel.leave();
      guild.connection = undefined;
      guild.queue = undefined;
    }
  };
}
