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
  createInfoEmbed,
  emptyQueueEmbed,
  killedSongEmbed,
} from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): string => {
  if (command) {
    const cmd = command.content.split(" ")[0];
    for (const alias of Kill._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`) return `${alias} :number`;
    }
  }
  return `${Kill._name} :number`;
};

export default abstract class Kill implements JuanitaCommand {
  static _name: string = "kill";
  static _aliases: string[] = ["kill", "unqueue", "unq", "remove", "rm"];
  static _description: string =
    "Removes the song at the given position from the queue";

  @Command(checkAliases)
  @Infos({
    aliases: Kill._aliases,
  })
  @Description(Kill._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild, channel, args } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(Kill._name, author.tag);
    GuildCommander.refresh(id, command);

    const index: number = args.number - 1;
    if (!queue || queue.empty()) {
      channel.send(emptyQueueEmbed());
    } else {
      if (queue.inrange(index)) {
        const song = queue.kill(index);
        channel.send(killedSongEmbed(song!));
      } else {
        channel.send(
          createInfoEmbed(
            ":exclamation::x:**Kan ikke fjerne sang fra ugyldig posisjon**"
          )
        );
      }
    }
  }
}
