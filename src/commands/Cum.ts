import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { createInfoEmbed } from "../utils/helpers";

@Discord()
class Cum {
  @SimpleCommand("cum", { aliases: ["join", "come", "j", "coom"] })
  async cum(command: SimpleCommandMessage) {
    Logger._logCommand("cum", command.message.author.tag)
    const joined = await JuanitaManager.joinChannel(command.message);
    if (joined) command.message.channel.send({ embeds: [cumEmbed()] });
  }
}

const cumEmbed = () => {
  return createInfoEmbed(
    ":kissing_heart: **Okei her kommer jeg** :heart_eyes:"
  );
};
