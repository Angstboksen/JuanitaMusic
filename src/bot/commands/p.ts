import { Message, VoiceChannel } from "discord.js";
import { ICommand, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect, tokenize } from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import QueueConstruct from "../QueueConstruct";
import { search } from "../YoutubeSearcher";
import { send } from "../JuanitaMessage";
import { play } from "../MediaPlayer";
import JuanitaGuild from "../Guild";
import * as db from "../../database/DatabaseHandler";

export default class P implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.P;
    this.message = "";
    this.help =
      "Will play the given song link, or search with the given keywords";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length > 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public getKeywords = (content: string): string[] => {
    const tokens: string[] = tokenize(content);
    return tokens.slice(1, tokens.length);
  };

  public prettifySongTitle = (song: ISong): ISong => {
    song.title = song.title.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
    return song;
  };

  public run = async (
    message: Message,
    guild: JuanitaGuild
  ): Promise<void | Message> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const keywords: string[] = this.getKeywords(message.content);
    const textChannel = message.channel;
    const channel: VoiceChannel = message.member?.voice.channel!;

    // No parameters specified
    if (keywords.length === 0) {
      return send(textChannel, ERRORS.NEED_MORE_SONG_INFO);
    }

    const song: ISong | undefined = await search(
      keywords.length === 1 ? keywords[0] : keywords.join(" "),
      message.author.id
    );

    // Song search failed
    if (song === undefined) {
      console.log(`No song found with keywords: ${keywords}`);
      return send(textChannel, ERRORS.NO_SONG_FOUND(keywords));
    }
    song.author = message.author.id;

    if (
      guild.queue === undefined ||
      (guild.queue.size() === 0 && guild.queue.current == undefined)
    ) {
      guild.queue = new QueueConstruct();
      guild.queue.enqueue(song);
      guild.connection = await channel.join();
      play(guild, channel);
    } else {
      guild.queue.enqueue(song);
      send(textChannel, MESSAGES.ADDED_TO_QUEUE(song.title));
      send(textChannel, await guild.queue.show());
    }
  };
}
