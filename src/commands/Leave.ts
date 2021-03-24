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
import { leaveEmbed } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of Leave._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${Leave._name}$`, "i");
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
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild, channel } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    Logger._logCommand(Leave._name, author.tag);
    GuildCommander.refresh(id, command);

    channel.send(leaveEmbed());
    juanitaGuild.leave();
  }
}
