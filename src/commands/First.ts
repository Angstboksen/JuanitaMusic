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
import { YTSearcher } from "../logic/YTSearcher";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand, Song } from "../types";
import { tokenize } from "../utils/helpers";
import { addedToQueueEmbed, createInfoEmbed } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): string => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of First._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`) return alias;
    }
  }
  return First._name;
};

export default abstract class First implements JuanitaCommand {
  static _name: string = "first";
  static _aliases: string[] = ["first", "f", "quick", "speed"];
  static _description: string =
    "Plays the song fetched based on the keywords provided";

  @Command(checkAliases)
  @Infos({
    aliases: First._aliases,
  })
  @Description(First._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, content, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(First._name, author.tag);
    GuildCommander.refresh(id, command);
    const args = tokenize(content);
    const song: Song | null = await YTSearcher.search(args, {
      tag: author.tag,
      id: author.id,
    });
    if (song === null || args.length === 0) {
      return channel.send(
        createInfoEmbed(
          ":mag: Fant ingen sanger med søkestreng gitt søkestreng"
        )
      );
    }

    queue.enqueue(song, true);
    if (queue.playing) {
      channel.send(addedToQueueEmbed(song));
    } else {
      JuanitaPlayer.play(juanitaGuild);
    }
  }
}
