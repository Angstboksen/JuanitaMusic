import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaPlayer } from "../music/JuanitaPlayer";

@Discord()
class Play {
  @SimpleCommand("play", { aliases: ["p", "sing"] })
  async play(command: SimpleCommandMessage) {
    Logger._logCommand("play", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      JuanitaPlayer.play(subscription, command.message);
    }
  }
}
