import { MessageEmbed } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { JuanitaManager } from "../logic/JuanitaManager";
import { JuanitaSubscription } from "../music/JuanitaSubscription";
import { createInfoEmbed, emptyQueueEmbed, secondsToTimestamp } from "../utils/helpers";

@Discord()
class Queue {
  @SimpleCommand("queue", { aliases: ["q", "que", "queu"] })
  async queue(command: SimpleCommandMessage) {
    Logger._logCommand("queue", command.message.author.tag)
    const subscription = await JuanitaManager.joinChannel(command.message);
    if (subscription)
      await command.message.channel.send({
        embeds: [queueEmbed(subscription)],
      });
  }
}

export const queueEmbed = (
  substription: JuanitaSubscription,
  page: number = 1
): MessageEmbed => {
  if (substription.queue.length == 0 || substription.current == null) {
    return emptyQueueEmbed();
  }

  const items = [];
  const { current, queue, time, bar } = substription;
  const maxPages = Math.ceil(queue.length / 5);
  if (page > maxPages) page = maxPages;
  else if (page < 1) page = 1;
  let totalTime = current.seconds;

  for (let i = (page - 1) * 5; i < queue.length; i++) {
    const item = queue[i].song;
    const { title, url, seconds, requestor } = item;
    if (i < (page - 1) * 5 + 5) {
      items.push(
        ` **\`${
          i + 1
        }\`.[${title}](${url})\nEstimert tid:** \`${secondsToTimestamp(
          seconds
        )}\`\n**Lagt til av**: \`${requestor!.tag}\``
      );
    }
    totalTime += seconds;
  }

  let desc =
    "**:notes:  Totalt antall sanger: ** `" +
    queue.length +
    "` \n\n" +
    (current !== null
      ? "------------------------------------------------------------\n :arrow_forward: **Nå spilles: **\n" +
        ` **[${current.title}](${
          current.url
        })\nEstimert tid igjen:** \`${secondsToTimestamp(
          time(current)
        )}\`\n\`${bar()}\`\n\n**Lagt til av**: \`${
          current.requestor!.tag
        }\`\n ------------------------------------------------------------ \n\n`
      : "") +
    items.join("\n\n") +
    "\n\n**:timer: Total beregnet tid:** " +
    `\`${secondsToTimestamp(
      totalTime
    )}\` \n\n Side \`${page}\` av \`${maxPages}\``;

  return createInfoEmbed(desc).setTitle(
    ":scroll: **Her er køen slik den ser ut nå** \n"
  );
};
