import {
  Client,
  Command,
  CommandMessage,
  Description,
  Discord,
  Guard,
  Infos,
} from "@typeit/discord";
import { Message, User } from "discord.js";
import SETUP_CONFIG from "../config";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand } from "../types";
import { queueEmbed } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of Q._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${Q._name}$`, "i");
};

export default abstract class Q implements JuanitaCommand {
  static _name: string = "q";
  static _aliases: string[] = ["q", "queue", "que", "queu"];
  static _description: string = "Shows the current queue";

  @Command(checkAliases)
  @Infos({
    aliases: Q._aliases,
  })
  @Description(Q._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(Q._name, author.tag);
    GuildCommander.refresh(id, command);

    await channel.send(queueEmbed(queue));
  }
}
