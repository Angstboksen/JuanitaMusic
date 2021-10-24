import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
} from "discordx";
import { rememberAlias, validateRemember } from "../api/songs/alias";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { SpotifySearcher } from "../logic/SpotifySearcher";
import { createInfoEmbed } from "../utils/helpers";

@Discord()
class Remember {
  @SimpleCommand("remember", {
    aliases: ["rem", "husk", "import"],
    argSplitter: " ",
  })
  async remember(
    @SimpleCommandOption("playlistid", { type: "STRING" })
    playlistid: string | undefined,
    @SimpleCommandOption("alias", { type: "STRING" })
    alias: string | undefined,
    command: SimpleCommandMessage
  ) {
    Logger._logCommand("remember", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      if (
        !playlistid ||
        !alias ||
        alias.length < 3 ||
        Number.isInteger(alias)
      ) {
        return command.message.channel.send({
          embeds: [
            createInfoEmbed(":x: Dette er feil format for denne kommandoen"),
          ],
        });
      }
      const playlistExists = await SpotifySearcher.findPlaylist(playlistid);

      if (playlistExists.statusCode !== 200)
        return command.message.channel.send({
          embeds: [
            createInfoEmbed(
              `:x: Spillelisten med id \`${playlistid}\` eksisterer ikke`
            ),
          ],
        });

      const validated = await validateRemember(alias);
      if (validated)
        return command.message.channel.send({
          embeds: [
            createInfoEmbed(
              `:x: Aliaset \`${alias}\` er allerede i bruk for spilleliste \`${validated.name}\``
            ),
          ],
        });

      await rememberAlias(playlistid, alias, playlistExists.name);
      command.message.channel.send({
        embeds: [
          createInfoEmbed(`:white_check_mark: Jeg husker nå \`${playlistid}\` som \`${alias}\`\n
        :watermelon: Du kan nå bruke kommando \`!spotify ${alias}\` for å spille av listen`),
        ],
      });
    }
  }
}
