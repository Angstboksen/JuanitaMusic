import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import SETUP_CONFIG from "../config";
import { BotJoinedVoiceChannel } from "../guards/BotJoinedVoicechannel";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand } from "../types";
import { noCurrentSongEmbed, songEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, Now._aliases, RegexOrString.REGEX);
};

export default abstract class Now implements JuanitaCommand {
  static _name: string = "now";
  static _aliases: string[] = ["now", "current", "np", "song"];
  static _description: string = "Shows the song currently playing";

  @Command(checkAliases)
  @Infos({
    aliases: Now._aliases,
  })
  @Description(Now._description)
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    logAndRefresh(Now._name, author.tag, id, command);

    if (queue.current) channel.send(songEmbed(queue.current, queue));
    else channel.send(noCurrentSongEmbed());
  }
}
