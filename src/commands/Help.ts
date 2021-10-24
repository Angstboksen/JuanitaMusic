import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { Logger } from "../logger/Logger";
import { createInfoEmbed } from "../utils/helpers";

@Discord()
class Help {
  @SimpleCommand("help", { aliases: ["commands", "h"] })
  async help(command: SimpleCommandMessage) {
    Logger._logCommand("help", command.message.author.tag)
    await command.message.channel.send({ embeds: [helpEmbed()] });
  }
}

export const helpEmbed = () => {
  return createInfoEmbed(
    ":arrow_up: Klikk på tittelen for å få en liste over kommandoer"
  )
    .setTitle(":newspaper: Hva kan jeg gjøre?")
    .setURL("https://github.com/Angstboksen/JuanitaMusic#commands");
};
