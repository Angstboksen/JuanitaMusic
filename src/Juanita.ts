import {
  Discord,
  CommandMessage,
  CommandNotFound,
} from "@typeit/discord";
import SETUP_CONFIG from "./config";
import * as Path from "path";
import { SpotifySearcher } from "./logic/SpotifySearcher";

@Discord(SETUP_CONFIG.prefix, {
  import: [Path.join(__dirname, "commands", "*.ts")],
})
export abstract class Juanita {
  static spotifySearcher = new SpotifySearcher();

  @CommandNotFound()
  notFound(command: CommandMessage) {
    console.log(command.content);
    command.channel.send("Command not found");
  }

  _reconnect = () => {
    console.log("Reconnecting");
  };
}
