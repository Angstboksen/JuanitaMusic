import { Discord, CommandMessage, CommandNotFound } from "@typeit/discord";
import SETUP_CONFIG from "./config";
import * as Path from "path";
import { SpotifySearcher } from "./logic/SpotifySearcher";
import { createInfoEmbed } from "./utils/helpers";

@Discord(SETUP_CONFIG.prefix, {
  import: [Path.join(__dirname, "commands", "*.ts")],
})
export abstract class Juanita {
  static spotifySearcher = new SpotifySearcher();

  @CommandNotFound()
  notFound(command: CommandMessage) {
    command.channel.send(
      createInfoEmbed(":question: **Det forsto jeg ikke helt**")
    );
  }

  _reconnect = () => {
    console.log("Reconnecting");
  };
}
