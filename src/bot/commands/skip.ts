import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  botAlreadyJoined,
  isCommandNameCorrect,
  tokenize,
} from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaMessage from "../JuanitaMessage";
import QueueConstruct from "../QueueConstruct";

export default class Skip implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.SKIP;
    this.message = "";
    this.help = "Will skip to the song at the index given in the queue";
    this.messageDispatcher = new JuanitaMessage();
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const queue: QueueConstruct | undefined = guild.queue;
    const index: number = parseInt(tokenize(message.content)[1]);
    const channel = message.channel;
    if (!guild.connection || !queue) {
      return;
    }
    if (!Number.isInteger(index)) {
      this.messageDispatcher.send(channel, ERRORS.ARGUMENT_NOT_INTEGER);
      return;
    }

    if (!queue.inrange(index)) {
      this.messageDispatcher.send(channel, ERRORS.NOT_VALID_QUEUE_INDEX);
      return;
    }

    if (guild.connection) {
      queue.shift(index);
      guild.connection.dispatcher.end();
      this.messageDispatcher.send(channel, MESSAGES.SKIP_ALOT(index));
    }
  };
}
