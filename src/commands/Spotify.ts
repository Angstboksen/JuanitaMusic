import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
} from "discordx";
import { validateRemember } from "../api/songs/alias";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { SpotifySearcher } from "../logic/SpotifySearcher";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { Song } from "../types";
import { createInfoEmbed, shuffleArray } from "../utils/helpers";
import { queueEmbed } from "./Queue";

@Discord()
class Spotify {
  @SimpleCommand("spotify", { aliases: ["sptf", "hax"] })
  async spotify(
    @SimpleCommandOption("playlist", { type: "STRING" })
    playlist: string | undefined,
    command: SimpleCommandMessage
  ) {
    Logger._logCommand("spotify", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      if (!playlist)
        return command.message.channel.send({
          embeds: [createInfoEmbed(":question: **Det forsto jeg ikke helt**")],
        });
      const remembered = await validateRemember(playlist);
      const validPlaylist = await SpotifySearcher.searchPlaylist(
        remembered ? remembered.plid : playlist,
        command.message.author
      );
      if (validPlaylist) {
        command.message.channel.send({
          embeds: [
            createInfoEmbed(
              `:cyclone: **Laster inn sanger fra** \`${validPlaylist.name}\``
            ),
          ],
        });
        subscription.spotifyEnqueue(command.message, subscription, shuffleArray(validPlaylist.tracks) as Song[]);
        if (!subscription.current) {
          JuanitaPlayer.play(subscription, command.message, false, true);
        } else {
          command.message.channel.send({
            embeds: [queueEmbed(subscription)],
          });
        }
      } else {
        command.message.channel.send({
          embeds: [
            createInfoEmbed(
              `:x: Fant ingen spilleliste med id \`${playlist}\``
            ),
          ],
        });
      }
    }
  }
}
