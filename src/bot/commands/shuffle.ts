import { Message } from "discord.js";
import { ICommand, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect, tokenize } from "../../utils/helpers";
import { ERRORS, LOGGER } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { send } from "../JuanitaMessage";
import { play } from "../MediaPlayer";
import QueueConstruct from "../QueueConstruct";
import * as db from "../../database/DatabaseHandler";

export default class Shuffle implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.SHUFFLE;
    this.message = "";
    this.help = "Will play the given playlist in shuffle mode";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const voiceChannel = message.member?.voice.channel!;
    const playlistname: string = tokenize(message.content)[1];
    const playlist = guild.getPlaylistByName(playlistname);
    if (!playlist) {
      send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    if (playlist.size() <= 0) {
      send(channel, ERRORS.PLAYLIST_HAS_NO_SONGS(playlistname));
      return;
    }
    guild.connection = await voiceChannel.join();
    const songs: ISong[] = playlist.getSongs(true);
    for (let s of songs) {
      db.addNewSong(s, message.author.id);
    }
    guild.queue = new QueueConstruct(songs);
    play(guild, voiceChannel);
  };
}
