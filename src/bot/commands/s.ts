import {
  Message,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { ICommand, IGuild } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { LOGGER, MESSAGES } from "../../utils/messages";
import { send } from "../JuanitaMessage";


export default class S implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;


  constructor() {
    this.type = CommandEnum.S;
    this.message = ":kissing_heart: **Okei her kommer jeg** :heart_eyes:";
    this.help = "Will skip to the next song in the queue";
    
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: IGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const connection: VoiceConnection | undefined = guild.connection;
    if (!connection || !connection.dispatcher)
      return console.log(LOGGER.NO_CONNECTION_COMMAND);
    if (connection.dispatcher !== undefined) {
      connection.dispatcher.end();
      send(channel, MESSAGES.SKIP_SONG);
    }
  };
}
