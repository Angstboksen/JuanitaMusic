import { Message } from "discord.js";
import { ICommand, IPlaylist } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect, tokenize } from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import { makeEmbed, send } from "../JuanitaMessage";

import Playlist from "../Playlist";

export default class List implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;


  constructor() {
    this.type = CommandEnum.LIST;
    this.message = "";
    this.help = "Will give overview over the songs in the given list";
    
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 2 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const playlistname: string = tokenize(message.content)[1];
    const playlist: IPlaylist | undefined = guild.getPlaylistByName(
      playlistname
    );
    if (!playlist) {
      send(channel, ERRORS.NO_LIST_EXISTS(playlistname));
      return;
    }
    const embed = makeEmbed(
      `:scroll: **Her er sangene i listen:** ${playlist.name} :scroll:`,
      MESSAGES.PLAYLIST_SONG_INFORMATION(playlist)
    );
    send(channel, embed);
  };
}
