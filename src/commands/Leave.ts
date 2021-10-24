import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { createInfoEmbed } from "../utils/helpers";

@Discord()
class Leave {
  @SimpleCommand("leave", { aliases: ["l", "disconnect", "kys", "die"] })
  async leave(command: SimpleCommandMessage) {
    Logger._logCommand("leave", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription && command.message.guild) {
      subscription.voiceConnection.destroy();
      JuanitaManager.delete(command.message.guild.id);
    }
  }
}
