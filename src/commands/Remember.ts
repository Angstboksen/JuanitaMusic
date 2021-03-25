import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import { rememberAlias, validateRemember } from "../api/songs/alias";
import SETUP_CONFIG from "../config";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Juanita } from "../Juanita";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { SpotifySearcher } from "../logic/SpotifySearcher";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { JuanitaCommand } from "../types";
import { createInfoEmbed, shuffleArray } from "../utils/helpers";

const checkAliases = (command?: CommandMessage, client?: Client): string => {
  if (command) {
    const cmd = command.content.split(" ")[0];
    for (const alias of Remember._aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return `${alias} :playlistid :alias`;
    }
  }
  return `${Remember._name} :playlistid :alias`;
};

export default abstract class Remember implements JuanitaCommand {
  static _name: string = "remember";
  static _aliases: string[] = ["remember", "rem", "husk", "import"];
  static _description: string =
    "Remembers the given Spotify playlist id as the given alias to be used later";

  @Command(checkAliases)
  @Infos({
    aliases: Remember._aliases,
  })
  @Description(Remember._description)
  @Guard(InVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, content, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    Logger._logCommand(Remember._name, author.tag);
    GuildCommander.refresh(id, command);
    const playlistid = command.args.playlistid;
    const given = command.args.alias;

    if (given.length < 3 || Number.isInteger(given)) {
      return channel.send(
        "Aliaset kan ikke være et tall, eller være kortere enn 3 bokstaver"
      );
    }

    const playlistExists = await Juanita.spotifySearcher.findPlaylist(
      playlistid
    );

    if (playlistExists.statusCode !== 200)
      return channel.send(
        createInfoEmbed(
          `:x: Spillelisten med id \`${playlistid}\` eksisterer ikke`
        )
      );

    const validated = await validateRemember(given);
    if (validated !== undefined)
      return channel.send(
        createInfoEmbed(
          `:x: Aliaset \`${given}\` er allerede i bruk for spilleliste \`${validated.name}\``
        )
      );

    await rememberAlias(playlistid, given, playlistExists.name);
    channel.send(
      createInfoEmbed(`:white_check_mark: Jeg husker nå \`${playlistid}\` som \`${given}\`\n
    :watermelon: Du kan nå bruke kommando \`!spotify ${given}\` for å spille av listen`)
    );
  }
}
