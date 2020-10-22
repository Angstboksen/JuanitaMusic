import {
  DMChannel,
  Message,
  NewsChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ICommand, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  botAlreadyJoined,
  isCommandNameCorrect,
  tokenize,
} from "../../utils/helpers";
import { LOGGER } from "../../utils/messages";
import YoutubeSearcher from "../YoutubeSearcher";

export default class P implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  searcher: YoutubeSearcher = new YoutubeSearcher();

  constructor() {
    this.type = CommandEnum.P;
    this.message = ":kissing_heart: **Okei her kommer jeg** :heart_eyes:";
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

  public run = async (message: Message): Promise<void | Message> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const keywords: string[] = this.getKeywords(message.content);
    const textChannel: TextChannel | DMChannel | NewsChannel = message.channel;
    const channel: VoiceChannel = message.member?.voice.channel!;

    // No parameters specified
    if (keywords.length === 0) {
      return textChannel.send(
        ":x: **Du må spesifisere hva som skal avspilles mannen!** :x:"
      );
    }

    const song: ISong | undefined = await this.searcher.search(
      keywords.join(" ")
    );

    // Song search failed
    if (song === undefined) {
      return textChannel.send(
        `:x: **Ingen sang funnet med denne søkestrengen:** ${keywords.join(
          " "
        )}:x:`
      );
    }

    console.log(song);
  };
}
