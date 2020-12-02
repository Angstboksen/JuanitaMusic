import { Message } from "discord.js";
import { ICommand, IGuild, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect, tokenize } from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { send } from "../JuanitaMessage";
import { search } from "../YoutubeSearcher";
import P from "./p";

const p = new P();

export default class Add implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.ADD;
    this.message = "";
    this.help =
      "Will add a song to the given list. The song will be either the given link, or a search for the given keywords";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length > 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const keywords: string[] = p.getKeywords(message.content);
    const playlistname = tokenize(message.content)[1];
    const sender = message.author.id;

    // No parameters specified
    if (keywords.length === 0) {
      return send(channel, ERRORS.NEED_MORE_SONG_INFO);
    }

    const song: ISong | undefined = await search(
      keywords.length === 1 ? keywords[0] : keywords.join(" "),
      message.author.id
    );

    if (!song) {
      send(channel, ERRORS.NO_SONG_FOUND(keywords));
      return;
    }

    let playlist = guild.getPlaylistByName(playlistname);
    if (!playlist) {
      send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    if (!playlist.trusts(sender)) {
      send(channel, ERRORS.NO_LIST_ACCESS);
      return;
    }

    let exists = playlist.hasSong(song.url);
    if (!exists) {
      playlist.addSong(song);
      send(channel, MESSAGES.ADDED_SONG_TO_LIST(song.title));
    } else {
      send(channel, ERRORS.SONG_ALREADY_EXISTS);
    }
  };
}
