import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaPlayer } from "../music/JuanitaPlayer";

@Discord()
class First {
  @SimpleCommand("first", { aliases: ["f", "quick", "speed"] })
  async first(command: SimpleCommandMessage) {
    Logger._logCommand("first", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      JuanitaPlayer.play(subscription, command.message, true);
    }
  }
}
