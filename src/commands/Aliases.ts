import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import { retrieveAliases } from "../api/songs/alias";
import SETUP_CONFIG from "../config";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand } from "../types";
import { aliasEmbed, noCurrentSongEmbed, songEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, Aliases._aliases, RegexOrString.REGEX);
};

export default abstract class Aliases implements JuanitaCommand {
  static _name: string = "aliases";
  static _aliases: string[] = ["aliases", "alist"];
  static _description: string =
    "Shows a list of all aliases and their corresponding spotify playlists";

  @Command(checkAliases)
  @Infos({
    aliases: Aliases._aliases,
  })
  @Description(Aliases._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    logAndRefresh(Aliases._name, author.tag, id, command);

    const aliases = await retrieveAliases();
    channel.send(aliasEmbed(aliases));
  }
}
