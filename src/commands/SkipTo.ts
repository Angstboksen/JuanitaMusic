import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
} from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { Song } from "../types";
import { createInfoEmbed, emptyQueueEmbed } from "../utils/helpers";

@Discord()
class SkipTo {
  @SimpleCommand("skipto", { aliases: ["jump", "st"], argSplitter: " " })
  async skipto(
    @SimpleCommandOption("index", { type: "INTEGER" })
    index: number | undefined,
    command: SimpleCommandMessage
  ) {
    Logger._logCommand("skipto", command.message.author.tag)
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
          const song = subscription.skipTo(index);
          JuanitaPlayer.skip(subscription, command.message, true);
          command.message.channel.send({
            embeds: [skippedToEmbed(song!, index + 1)],
          });
        } else {
          command.message.channel.send({
            embeds: [
              createInfoEmbed(
                ":exclamation::x:**Kan hoppe til ugyldig posisjon i køen**"
              ),
            ],
          });
        }
      }
    }
  }
}

export const skippedToEmbed = (song: Song, position: number) => {
  return createInfoEmbed(
    `:white_check_mark: Hoppet til posisjon \`${position}\` i køen.\n 
    :arrow_forward: Spiller nå: \`${song.title}\` fra køen`
  );
};
