import { MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import { IGuild } from "../utils/api";
import { formattedTime } from "../utils/helpers";
import { ERRORS, MESSAGES } from "../utils/messages";

export default class MediaPlayer {
  constructor() {}

  play = (guild: IGuild) => {
    const queue = guild.queue!;
    const textChannel = guild.textChannel!;
    if (queue.size() === 0) {
      queue.playing = false;
      queue.current = undefined;
      textChannel.send(MESSAGES.QUEUE_EMPTY);
      return;
    }

    const song = queue.next();
    if (!song) return textChannel.send(ERRORS.SONG_PLAY_FAIL);
    const estimatedtime = formattedTime(song.length);
    const ytdl_song = ytdl(song.url, { filter: "audioonly" });
    const dispatcher = guild
      .connection!.play(ytdl_song)
      .on("finish", () => {
        this.play(guild);
      })
      .on("error", (error) => {
        console.log(error);
        textChannel.send(ERRORS.SONG_PLAY_FAIL);
      });

    queue.playing = true;
    queue.current = song;
    queue.dequeue();
    dispatcher.setVolumeLogarithmic(queue.volume / 5);

    const embed = new MessageEmbed();
    embed.setColor("RANDOM");
    embed.setTitle(":arrow_forward: **Hva spilles nå? ** :arrow_forward:");
    embed.setDescription(
      MESSAGES.SONG_INFO(song.title, song.url, queue.size(), estimatedtime)
    );
    textChannel.send(embed);
  };
}
