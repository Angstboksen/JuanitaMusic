import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { retrieveAliases } from "../api/songs/alias";
import { createInfoEmbed } from "../utils/helpers";

@Discord()
class Aliases {
  @SimpleCommand("aliases", { aliases: ["alist"] })
  async aliases(command: SimpleCommandMessage) {
    Logger._logCommand("aliases", command.message.author.tag)
    const { channel } = command.message;
    const aliases = await retrieveAliases();
    channel.send({ embeds: [aliasEmbed(aliases)] });
  }
}

const aliasEmbed = (
  aliases: { alias: string; plid: string; name: string }[]
) => {
  if (aliases.length === 0)
    return createInfoEmbed(
      ":watermelon: Bruk `!remember <id> <alias>` for å legge til"
    ).setTitle(":scream_cat: Ingen aliaser er lagret");
  let desc = "";
  for (let i = 0; i < aliases.length; i++) {
    desc += `:cyclone: **Navn**: [${aliases[i].name}](https://open.spotify.com/playlist/${aliases[i].plid}) | :spy: **Alias:** \`${aliases[i].alias}\`  \n\n`;
  }
  desc += `\n:watermelon: Bruk \`!spotify <alias>\` for å spille av lista \n\n :mag: Det er lagret totalt \`${aliases.length}\` aliaser`;
  return createInfoEmbed(desc).setTitle(
    ":arrow_down: Her er alle aliasene som er lagret"
  );
};
