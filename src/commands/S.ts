import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import SETUP_CONFIG from "../config";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand } from "../types";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];
    for (const alias of S._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${S._name}$`, "i");
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
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    Logger._logCommand(S._name, author.tag);
    GuildCommander.refresh(id, command);

    JuanitaPlayer.skip(juanitaGuild);
  }
}
