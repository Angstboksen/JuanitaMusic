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
import { Juanita } from "../Juanita";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand } from "../types";
import { createInfoEmbed, shuffleArray } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): string => {
  if (command) {
    const cmd = command.content.split(" ")[0];
    for (const alias of Spotify._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return `${alias} :playlistid`;
    }
  }
  return `${Spotify._name} :playlistid`;
};

export default abstract class Spotify implements JuanitaCommand {
  static _name: string = "spotify";
  static _aliases: string[] = ["spotify", "sptf", "hax"];
  static _description: string =
    "Shuffles a playlist from spotify with the given playlist id";

  @Command(checkAliases)
  @Infos({
    aliases: Spotify._aliases,
  })
  @Description(Spotify._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, content, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(Spotify._name, author.tag);
    GuildCommander.refresh(id, command);
    const playlistid = command.args.playlistid;
    const validPlaylist = await Juanita.spotifySearcher.searchPlaylist(
      playlistid,
      author
    );
    if (validPlaylist !== undefined) {
      channel.send(
        createInfoEmbed(
          `:cyclone: **Laster inn sanger fra** \`${validPlaylist.name}\``
        )
      );
      queue.songs = shuffleArray(validPlaylist.tracks);
      if (queue.playing) juanitaGuild.connection!.dispatcher.end();
      else JuanitaPlayer.play(juanitaGuild);
    }
  }
}