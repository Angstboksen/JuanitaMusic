import { Message, TextChannel, VoiceChannel } from "discord.js";
import { ICommand } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { LOGGER } from "../../utils/messages";

export default class Cum implements ICommand {
  type: CommandEnum;

  constructor() {
    this.type = CommandEnum.CUM;
  }

  public isValid = (tokens: string[]): boolean => {
    console.log("Validating");
    console.log(tokens);
    return (
      tokens.length === 1 && tokens[0].substring(1, tokens[0].length) === "cum"
    );
  };

  public run = (message: Message): void => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    message.channel.send(message.content);
  };
}
