import { Message, TextChannel, VoiceChannel } from "discord.js";
import { TextChange } from "typescript";
import { ICommand } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import { botAlreadyJoined, isCommandNameCorrect } from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import JuanitaGuild from "../Guild";
import P from "./p";

const p = new P();
const userRegex: RegExp = /<@!(\d+)>/;

export default class Trust implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;

  constructor() {
    this.type = CommandEnum.TRUST;
    this.message = "";
    this.help =
      "Will give editing permissions for the given list to the given user";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length === 3 && isCommandNameCorrect(tokens[0], this.type);
  };

  public run = async (message: Message, guild: JuanitaGuild): Promise<void> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const channel = message.channel;
    const sender = message.member!.id;
    const keywords: string[] = p.getKeywords(message.content);
    const playlistname: string = keywords[0];
    const taggedUser = keywords[1].match(userRegex);
    if (!taggedUser) {
      channel.send(ERRORS.CANNOT_ADD_TRUSTED_USER);
      return;
    }
    const trusted = taggedUser[1];

    if (!trusted) {
      return;
    }
    if (sender === trusted) {
      channel.send(ERRORS.SAME_TRUST_USER);
      return;
    }
    let playlist = guild.getPlaylistByName(playlistname);
    if (!playlist) {
      channel.send(ERRORS.NO_LIST);
      return;
    }
    if (playlist.creator !== sender) {
      message.channel.send(ERRORS.NOT_YOUR_LIST);
      return;
    }

    playlist.addTrustedUser(trusted);
    channel.send(MESSAGES.TRUSTED_USER(trusted));
  };
}
