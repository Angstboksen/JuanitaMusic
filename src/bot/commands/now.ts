import { Message, VoiceChannel } from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  formattedTime,
  isCommandNameCorrect,
} from "../../utils/helpers";
import { LOGGER, MESSAGES } from "../../utils/messages";
import { makeEmbed, send } from "../JuanitaMessage";

export default class Now implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.NOW;
    this.message = "";
    this.help = "Gives information about the currently playing song";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    if (guild.queue && guild.queue.current) {
      let song = guild.queue.current;
      const estimatedtime = formattedTime(song.length);
      const embed = makeEmbed(
        ":arrow_forward: **Hva spilles nå? ** :arrow_forward:",
        MESSAGES.GET_SONG_INFO(
          song.title,
          song.url,
          guild.queue.size(),
          estimatedtime
        )
      );
      send(channel, embed);
    } else {
      send(channel, MESSAGES.NO_CURRENT_SONG);
    }
  };
}
