import {
  Discord,
  CommandMessage,
  CommandNotFound,
  On,
  ArgsOf,
} from "@typeit/discord";
import SETUP_CONFIG from "./config";
import * as Path from "path";
import { SpotifySearcher } from "./logic/SpotifySearcher";
import { createInfoEmbed, queueEmbed } from "./utils/helpers";
import { GuildCommander } from "./logic/GuildCommander";
import { Client, MessageReaction } from "discord.js";

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

  @On("messageReactionAdd")
  async messageReactionAdd(
    [message]: ArgsOf<"messageReactionAdd">,
    client: Client
  ) {
    this.editQueuePage(message, client);
  }

  @On("messageReactionRemove")
  async messageReaction(
    [message]: ArgsOf<"messageReactionRemove">,
    client: Client
  ) {
    this.editQueuePage(message, client);
  }

  editQueuePage = async (message: MessageReaction, client: Client) => {
    const isBot = message.me;
    if (isBot) return;
    const { guild, embeds } = message.message;
    const { title, description } = embeds[0];
    if (
      title == ":scroll: **Her er køen slik den ser ut nå**" &&
      description !== null
    ) {
      let page = +description
        .split("Side")[1]
        .replace(/\s/g, "")
        .replace(/`/g, "")
        .split("av")[0];
      const queue = GuildCommander.get(guild!).queue;
      const max = Math.ceil(queue.size() / 5);
      if (message.emoji.name == "⬅️") {
        if (page === 0) return;
        page--;
      } else if (message.emoji.name == "➡️") {
        if (page === max) return;
        page++;
      }
      await message.message.edit(queueEmbed(queue, page));
    }
  };

  _reconnect = () => {
    console.log("Reconnecting");
  };
}
