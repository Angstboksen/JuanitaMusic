import { DMChannel, MessageEmbed, NewsChannel, TextChannel } from "discord.js";

export default class JuanitaMessage {

  makeEmbed = (title: string, description: string) => {
    const embed = new MessageEmbed();
    embed.setTitle(title)
    embed.setDescription(description)
    return embed
  }

  send = (channel: TextChannel | NewsChannel | DMChannel, message: string | MessageEmbed) => {
    channel.send(message);
  };
}
