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
import { YTSearcher } from "../logic/YTSearcher";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand, Song } from "../types";
import { tokenize } from "../utils/helpers";
import { addedToQueueEmbed, createInfoEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, P._aliases, RegexOrString.STRING, "");
};

export default abstract class P implements JuanitaCommand {
  static _name: string = "p";
  static _aliases: string[] = ["p", "play", "sing"];
  static _description: string =
    "Plays or adds to queue the song fetched based on the keywords provided";

  @Command(checkAliases)
  @Infos({
    aliases: P._aliases,
  })
  @Description(P._description)
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, content, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    logAndRefresh(P._name, author.tag, id, command);

    const args = tokenize(content);
    const song: Song | null = await YTSearcher.search(args, {
      tag: author.tag,
      id: author.id,
    });
    if (song === null || args.length === 0) {
      return channel.send(
        createInfoEmbed(
          ":mag: Fant ingen sanger med gitt søkestreng"
        )
      );
    }

    queue.enqueue(song);
    if (queue.playing) {
      channel.send(addedToQueueEmbed(song));
    } else {
      JuanitaPlayer.play(juanitaGuild);
    }
  }
}
