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
import { JuanitaCommand } from "../types";
import { botCanJoin, cumEmbed } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of Cum._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${Cum._name}$`, "i");
};

export default abstract class Cum implements JuanitaCommand {
  static _name: string = "cum";
  static _aliases: string[] = ["cum", "join", "come", "j"];
  static _description: string =
    "Makes the bot join the voicechannel the user is in";

  @Command(checkAliases)
  @Infos({
    aliases: Cum._aliases,
  })
  @Description(Cum._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild, member, channel } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, connection } = juanitaGuild;

    Logger._logCommand(Cum._name, author.tag);
    GuildCommander.refresh(id, command);

    if (!connection && botCanJoin(command)) {
      channel.send(cumEmbed());
      await juanitaGuild.join(member!);
    }
  }
}
