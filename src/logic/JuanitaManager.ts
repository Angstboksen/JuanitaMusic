import { GuildMember, Message, Snowflake } from "discord.js";
import {
  joinVoiceChannel,
  DiscordGatewayAdapterCreator,
} from "@discordjs/voice";
import { JuanitaSubscription } from "../music/JuanitaSubscription";
import { createInfoEmbed } from "../utils/helpers";

export class JuanitaManager {
  static subscriptions = new Map<Snowflake, JuanitaSubscription>();

  static getSubstription = (
    guildId: string | null
  ): JuanitaSubscription | undefined => {
    if (!guildId) return undefined;
    return JuanitaManager.subscriptions.get(guildId);
  };

  static setSubscription = (
    guildId: string,
    subscription: JuanitaSubscription
  ) => {
    JuanitaManager.subscriptions.set(guildId, subscription);
  };

  static delete = (guildId: string) => {
    this.subscriptions.delete(guildId);
  };

  static joinChannel = async (message: Message) => {
    const { member, guildId } = message;
    let subscription = JuanitaManager.getSubstription(guildId);
    if (!subscription) {
      if (member instanceof GuildMember && member.voice.channel) {
        const channel = member.voice.channel;
        subscription = new JuanitaSubscription(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
              .voiceAdapterCreator as DiscordGatewayAdapterCreator,
          })
        );
        subscription.voiceConnection.on("error", console.warn);
        JuanitaManager.setSubscription(channel.guild.id, subscription);
      }
    }

    if (!subscription) {
      await message.channel.send({
        embeds: [
          createInfoEmbed(
            ":robot: **Du må være i en voice channel bro!** :thinking:"
          ),
        ],
      });
      return undefined;
    }
    return subscription;
  };
}
