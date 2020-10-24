import { DMChannel, MessageEmbed, NewsChannel, TextChannel } from "discord.js";

export const makeEmbed = (title: string, description: string) => {
  const embed = new MessageEmbed();
  embed.setTitle(title);
  embed.setDescription(description);
  return embed;
};

export const send = (
  channel: TextChannel | NewsChannel | DMChannel,
  message: string | MessageEmbed
) => {
  channel.send(message);
};
