import { Message, VoiceChannel } from "discord.js";
import { ICommand } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  botAlreadyJoined,
  isCommandNameCorrect,
  tokenize,
} from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { send } from "../JuanitaMessage";

export default class DelSong implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.DELSONG;
    this.message = "";
    this.help = "Will delete the song at the given index in the list.";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 3 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const tokens = tokenize(message.content);
    const playlistname = tokens[1];
    const songindex: number = parseInt(tokens[2]);
    const sender = message.member!.id;

    const playlist = guild.getPlaylistByName(playlistname);
    if (!playlist) {
      send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    if (
      !Number.isInteger(songindex) ||
      songindex < 1 ||
      songindex > playlist.size()
    ) {
      send(channel, ERRORS.ARGUMENT_NOT_INTEGER);
      return;
    }
    if (!playlist.trusts(sender)) {
      send(channel, ERRORS.NO_LIST_ACCESS);
      return;
    }
    const song = playlist.removeSong(songindex - 1);
    send(channel, MESSAGES.REMOVED_SONG(song.title));
  };
}
