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
import {
  noCurrentSongEmbed,
  songEmbed,
} from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): RegExp => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of Now._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return new RegExp(`${alias}$`, "i");
    }
  }
  return new RegExp(`${Now._name}$`, "i");
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
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(Now._name, author.tag);
    GuildCommander.refresh(id, command);

    if (queue.current) channel.send(songEmbed(queue.current, queue));
    else channel.send(noCurrentSongEmbed());
  }
}
