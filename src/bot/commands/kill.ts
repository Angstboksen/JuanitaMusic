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

export default class Kill implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.KILL;
    this.message = "";
    this.help = "Remove a specific song from the queue";
    this.messageDispatcher = new JuanitaMessage();
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const index = parseInt(tokenize(message.content)[1]);
    const queue = guild.queue;

    if (!queue || queue.size() === 0) {
      this.messageDispatcher.send(channel, ERRORS.QUEUE_NOT_FOUND);
      return;
    }
    if (!queue.inrange(index)) {
      this.messageDispatcher.send(channel, ERRORS.ARGUMENT_NOT_INTEGER);
      return;
    }
    const song = queue.songs[index - 1];
    queue.songs.splice(index - 1, 1);
    this.messageDispatcher.send(
      channel,
      MESSAGES.REMOVED_SONG_FROM_QUEUE(song.title)
    );
  };
}
