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
import {
  createInfoEmbed,
  emptyQueueEmbed,
  skippedToEmbed,
} from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(
    command,
    SkipTo._aliases,
    RegexOrString.STRING,
    " :number"
  );
};

export default abstract class SkipTo implements JuanitaCommand {
  static _name: string = "st";
  static _aliases: string[] = ["st", "skipto", "jump"];
  static _description: string = "Jumps to the given position in the queue";

  @Command(checkAliases)
  @Infos({
    aliases: SkipTo._aliases,
  })
  @Description(SkipTo._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { author, guild, channel, args } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    logAndRefresh(SkipTo._name, author.tag, id, command);

    const index: number = args.number - 1;
    if (!queue || queue.empty()) {
      channel.send(emptyQueueEmbed());
    } else {
      if (queue.inrange(index)) {
        const song = queue.skipTo(index);
        JuanitaPlayer.skip(juanitaGuild);
        channel.send(skippedToEmbed(song!, index + 1));
      } else {
        channel.send(
          createInfoEmbed(
            ":exclamation::x:**Kan hoppe til ugyldig posisjon i køen**"
          )
        );
      }
    }
  }
}
