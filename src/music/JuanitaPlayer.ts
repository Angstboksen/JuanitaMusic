import { entersState, VoiceConnectionStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { Track } from "./Track";
import { JuanitaSubscription } from "./JuanitaSubscription";
import {
  addedToQueueEmbed,
  createInfoEmbed,
  emptyQueueEmbed,
  skipSongEmbed,
} from "../utils/helpers";

export class JuanitaPlayer {
  static play = async (
    subscription: JuanitaSubscription,
    message: Message,
    first: boolean = false,
    spotify: boolean = false
  ) => {
    try {
      await entersState(
        subscription.voiceConnection,
        VoiceConnectionStatus.Ready,
        5e3
      );
    } catch (error) {
      console.warn(error);
      await message.channel.send({
        embeds: [
          createInfoEmbed(
            "Failed to join voice channel within 5 seconds, please try again later!"
          ),
        ],
      });
      return;
    }

    try {
      if (spotify) return;
      let track = await Track.from(message, subscription);

      if (!track) {
        throw new Error();
      }
      if (first) subscription.enqueue(track, true);
      else subscription.enqueue(track);

      await message.channel.send({ embeds: [addedToQueueEmbed(track.song)] });
    } catch (error) {
      console.warn(error);
      await message.reply("Failed to play track, please try again later!");
    }
  };

  static skip = async (
    subscription: JuanitaSubscription,
    message: Message,
    silent: boolean = false
  ) => {
    if (subscription) {
      subscription.audioPlayer.stop();
      if (!silent) await message.channel.send({ embeds: [skipSongEmbed()] });
      else {
        if (!silent)
          await message.channel.send({ embeds: [emptyQueueEmbed()] });
      }
    }
  };
}
