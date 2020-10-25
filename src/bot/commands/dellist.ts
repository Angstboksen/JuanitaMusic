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

export default class DelList implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.DELLIST;
    this.message = ":kissing_heart: **Okei her kommer jeg** :heart_eyes:";
    this.help =
      "Will make the bot join the voice channel. It will not play anything";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const playlistname = tokenize(message.content)[1];
    const sender = message.member!.id;
    const playlist = guild.getPlaylistByName(playlistname);
    if (!playlist) {
      send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    if (!playlist.trusts(sender)) {
      send(channel, ERRORS.NO_LIST_ACCESS);
      return;
    }
    guild.removePlaylist(playlistname);
    send(channel, MESSAGES.REMOVED_LIST(playlistname));
  };
}
