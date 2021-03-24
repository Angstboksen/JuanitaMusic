import { GuardFunction } from "@typeit/discord";
import { Logger } from "../logger/Logger";
import { createInfoEmbed } from "../utils/helpers";

export const InVoiceChannel: GuardFunction<"message"> = async (
  [message],
  client,
  next
) => {
  const channel = message.member?.voice.channel;
  if (channel !== undefined && channel !== null) await next();
  else {
    message.channel.send(
      createInfoEmbed(
        ":robot: **Du må være i en voice channel bro!** :thinking:"
      )
    );
    Logger.debug(
      `${message.author.tag} tried to access commands without being in a channel`
    );
  }
};
