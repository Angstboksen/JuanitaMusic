import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaPlayer } from "../music/JuanitaPlayer";

@Discord()
class Skip {
  @SimpleCommand("skip", { aliases: ["s", "yeet"] })
  async skip(command: SimpleCommandMessage) {
    Logger._logCommand("skip", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) JuanitaPlayer.skip(subscription, command.message);
  }
}