import { Message } from "discord.js";
import { ICommand, IGuild, IPlaylist } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER, MESSAGES } from "../../utils/messages";
import { makeEmbed, send } from "../JuanitaMessage";


export default class ListAll implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;


  constructor() {
    this.type = CommandEnum.LISTALL;
    this.message = "";
    this.help =
      "Will list all the stored lists with their name, number of songs and creator";
    
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const playlists: IPlaylist[] = guild.playlists;

    let text = "";
    let count = 0;
    for (let list of guild.playlists) {
      count++;
      const amount = list.songs.length;
      text += MESSAGES.PLAYLIST_INFO(list.name, amount, list.creator);
    }
    if (count === 0) {
      text = MESSAGES.EMPTY_PLAYLIST_INFO;
    }

    const embed = makeEmbed(
      MESSAGES.AMOUNT_OF_LISTS(playlists.length),
      text
    );
    send(channel, embed);
  };
}
