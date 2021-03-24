import {
  Client,
  Command,
  CommandMessage,
  Description,
  Infos,
} from "@typeit/discord";
import SETUP_CONFIG from "../config";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand, Song } from "../types";
import { helpEmbed } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of Help._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${Help._name}$`, "i");
};

export default abstract class Help implements JuanitaCommand {
  static _name: string = "help";
  static _aliases: string[] = ["help", "commands", "h", "how"];
  static _description: string =
    "Provides a list of all current possible commands";

  @Command(checkAliases)
  @Infos({
    aliases: Help._aliases,
  })
  @Description(Help._description)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    Logger._logCommand(Help._name, author.tag);
    GuildCommander.refresh(id, command);

    await channel.send(helpEmbed());
  }
}
