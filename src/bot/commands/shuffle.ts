import { Message } from "discord.js";
import { ICommand, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect, tokenize } from "../../utils/helpers";
import { ERRORS, LOGGER } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import JuanitaMessage from "../JuanitaMessage";
import MediaPlayer from "../MediaPlayer";
import QueueConstruct from "../QueueConstruct";

const player: MediaPlayer = new MediaPlayer();

export default class Shuffle implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  messageDispatcher: JuanitaMessage;

  constructor() {
    this.type = CommandEnum.SHUFFLE;
    this.message = "";
    this.help = "Will play the given playlist in shuffle mode";
    this.messageDispatcher = new JuanitaMessage();
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
      this.messageDispatcher.send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    if (playlist.size() <= 0) {
      this.messageDispatcher.send(
        channel,
        ERRORS.PLAYLIST_HAS_NO_SONGS(playlistname)
      );
      return;
    }
    guild.connection = await voiceChannel.join();
    const songs: ISong[] = playlist.getSongs(true);
    guild.queue = new QueueConstruct(songs);
    player.play(guild);
  };
}
