import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER } from "../../utils/messages";

export default class Q implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.Q;
    this.message = "";
    this.help = "Will show the current queue";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    if (guild.queue) {
      guild.textChannel!.send(await guild.queue.show());
    }
  };
}
