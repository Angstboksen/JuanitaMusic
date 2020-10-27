import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect } from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { send } from "../JuanitaMessage";
import { play } from "../MediaPlayer";
import QueueConstruct from "../QueueConstruct";
import { search } from "../YoutubeSearcher";
import P from "./p";

const p = new P();

export default class First implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.FIRST;
    this.message = "";
    this.help = "Will place the given song fist in the current queue";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length > 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const keywords: string[] = p.getKeywords(message.content);
    const textChannel = message.channel;
    const channel: VoiceChannel = message.member?.voice.channel!;

    // No parameters specified
    if (keywords.length === 0) {
      return send(textChannel, ERRORS.NEED_MORE_SONG_INFO);
    }

    const song: ISong | undefined = await search(
      keywords.join(" ")
    );

    if (!song) {
      send(textChannel, ERRORS.NO_SONG_FOUND(keywords));
      return;
    }

    song.title = song.title.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );

    if (guild.queue === undefined || (guild.queue.size() === 0 && guild.queue.current == undefined)) {
      guild.queue = new QueueConstruct();
      guild.queue.enqueue(song, true);
      guild.connection = await channel.join();
      play(guild, channel);
    } else {
      guild.queue.enqueue(song, true);
      send(textChannel, MESSAGES.ADDED_TO_QUEUE(song.title));
      send(textChannel, await guild.queue.show());
    }
  };
}
