import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
} from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { createInfoEmbed, emptyQueueEmbed } from "../utils/helpers";

@Discord()
class Kill {
  @SimpleCommand("kill", {
    aliases: ["unqueue", "unq", "remove", "rm"],
    argSplitter: " ",
  })
  async Kill(
    @SimpleCommandOption("index", { type: "INTEGER" })
    index: number | undefined,
    command: SimpleCommandMessage
  ) {
    Logger._logCommand("kill", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription) {
      if (!index)
        return command.message.channel.send({
          embeds: [createInfoEmbed(":question: **Det forsto jeg ikke helt**")],
        });
      index = index - 1;
      const { queue } = subscription;
      if (!queue || queue.length == 0) {
        command.message.channel.send({ embeds: [emptyQueueEmbed()] });
      } else {
        if (subscription.inrange(index)) {
          const song = subscription.kill(index);
          command.message.channel.send({
            embeds: [killedSongEmbed(song.title)],
          });
        } else {
          command.message.channel.send({
            embeds: [
              createInfoEmbed(
                ":exclamation::x:**Kan ikke fjerne sang fra ugyldig posisjon**"
              ),
            ],
          });
        }
      }
    }
  }
}

export const killedSongEmbed = (song: string) => {
  return createInfoEmbed(`:white_check_mark: Fjernet \`${song}\` fra køen`);
};
