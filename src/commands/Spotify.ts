import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import { validateRemember } from "../api/songs/alias";
import SETUP_CONFIG from "../config";
import { BotJoinedVoiceChannel } from "../guards/BotJoinedVoicechannel";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Juanita } from "../Juanita";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand } from "../types";
import { createInfoEmbed, queueEmbed, shuffleArray } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(
    command,
    Spotify._aliases,
    RegexOrString.STRING,
    " :playlistid"
  );
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
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    logAndRefresh(Spotify._name, author.tag, id, command);

    const playlistid = command.args.playlistid;
    const remembered = await validateRemember(playlistid);

    const validPlaylist = await Juanita.spotifySearcher.searchPlaylist(
      remembered ? remembered.plid : playlistid,
      author
    );
    if (validPlaylist !== undefined) {
      channel.send(
        createInfoEmbed(
          `:cyclone: **Laster inn sanger fra** \`${validPlaylist.name}\``
        )
      );
      queue.songs = queue.songs.concat(shuffleArray(validPlaylist.tracks));
      if (!queue.playing) JuanitaPlayer.play(juanitaGuild);
      else {
        const msg = await channel.send(queueEmbed(queue));
        await msg.react("⬅️");
        await msg.react("➡️");
      }
    } else {
      channel.send(
        createInfoEmbed(`:x: Fant ingen spilleliste med id \`${playlistid}\``)
      );
    }
  }
}
