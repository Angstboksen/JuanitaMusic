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
import { BotJoinedVoiceChannel } from "../guards/BotJoinedVoicechannel";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Juanita } from "../Juanita";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand } from "../types";
import { createInfoEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(
    command,
    Remember._aliases,
    RegexOrString.STRING,
    " :playlistid :alias"
  );
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
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id } = juanitaGuild;

    logAndRefresh(Remember._name, author.tag, id, command);

    const playlistid = command.args.playlistid;
    const given = command.args.alias;

    if (!given || given.length < 3 || Number.isInteger(given)) {
      return channel.send(
        createInfoEmbed(
          "Aliaset kan ikke være et tall, eller være kortere enn 3 bokstaver"
        )
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
