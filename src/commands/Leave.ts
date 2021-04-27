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
import { leaveEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, Leave._aliases, RegexOrString.REGEX);
};

export default abstract class Leave implements JuanitaCommand {
  static _name: string = "leave";
  static _aliases: string[] = ["leave", "l", "disconnect", "kys", "die"];
  static _description: string =
    "Leaves the voicechannel the bot is currently in";

  @Command(checkAliases)
  @Infos({
    aliases: Leave._aliases,
  })
  @Description(Leave._description)
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild, channel } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    logAndRefresh(Leave._name, author.tag, id, command);

    channel.send(leaveEmbed());
    juanitaGuild.leave();
  }
}
