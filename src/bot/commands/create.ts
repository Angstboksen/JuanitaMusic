import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  botAlreadyJoined,
  isCommandNameCorrect,
  tokenize,
} from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { send } from "../JuanitaMessage";
import Playlist from "../Playlist";

export default class Create implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.CREATE;
    this.message = "";
    this.help = "Will create a new empty list with the given name";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const playlistname = tokenize(message.content)[1];
    const exists = guild.getPlaylistByName(playlistname);
    const sender = message.author.id;
    let saved = false;

    if (exists || playlistname.length >= 45) {
      saved = false;
    } else {
      const newList = new Playlist(guild.id, playlistname, [], sender, [
        sender,
      ]);
      saved = guild.addPlaylist(newList);
    }
    saved
      ? send(channel, MESSAGES.ADDED_NEW_LIST(playlistname, sender))
      : send(channel, ERRORS.FAIL_MAKE_LIST(playlistname));
  };
}
