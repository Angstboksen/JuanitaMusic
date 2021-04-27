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
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand } from "../types";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, S._aliases, RegexOrString.REGEX);
};

export default abstract class S implements JuanitaCommand {
  static _name: string = "s";
  static _aliases: string[] = ["s", "skip"];
  static _description: string = "Skips the song currently playing";

  @Command(checkAliases)
  @Infos({
    aliases: S._aliases,
  })
  @Description(S._description)
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    logAndRefresh(S._name, author.tag, id, command);

    JuanitaPlayer.skip(juanitaGuild);
  }
}
