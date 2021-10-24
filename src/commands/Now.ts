import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { noCurrentSongEmbed, songEmbed } from "../utils/helpers";

@Discord()
class Now {
  @SimpleCommand("now", { aliases: ["current", "np", "song"] })
  async now(command: SimpleCommandMessage) {
    Logger._logCommand("now", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      if (subscription.current)
        command.message.channel.send({
          embeds: [songEmbed(subscription.current, subscription)],
        });
      else command.message.channel.send({ embeds: [noCurrentSongEmbed()] });
    }
  }
}
