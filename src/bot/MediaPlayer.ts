import {
  DMChannel,
  MessageEmbed,
  NewsChannel,
  StreamDispatcher,
  TextChannel,
} from "discord.js";
import { Readable } from "stream";
import ytdl from "ytdl-core";
import { IGuild, ISong } from "../utils/api";
import { formattedTime } from "../utils/helpers";
import { ERRORS, MESSAGES } from "../utils/messages";
import QueueConstruct from "./QueueConstruct";
import * as db from "../database/DatabaseHandler";

export const play = async (guild: IGuild) => {
  const queue: QueueConstruct = guild.queue!;
  const textChannel: TextChannel | DMChannel | NewsChannel = guild.textChannel!;
  if (queue.size() === 0) {
    queue.playing = false;
    queue.current = undefined;
    textChannel.send(MESSAGES.QUEUE_EMPTY);
    return;
  }

  const song: ISong = queue.next();
  if (!song) return textChannel.send(ERRORS.SONG_PLAY_FAIL);
  db.addNewSong(song);
  const estimatedtime: string = formattedTime(song.length);
  const ytdl_song: Readable = ytdl(song.url, { filter: "audioonly" });
  const dispatcher: StreamDispatcher = guild
    .connection!.play(ytdl_song)
    .on("finish", async () => {
      await play(guild);
    })
    .on("error", (error) => {
      console.log(error);
      textChannel.send(ERRORS.SONG_PLAY_FAIL);
    });

  queue.playing = true;
  queue.current = song;
  queue.dequeue();
  dispatcher.setVolumeLogarithmic(queue.volume / 5);

  const embed: MessageEmbed = new MessageEmbed();
  embed.setColor("RANDOM");
  embed.setTitle(":arrow_forward: **Hva spilles nå? ** :arrow_forward:");
  embed.setDescription(
    MESSAGES.SONG_INFO(song.title, song.url, queue.size(), estimatedtime)
  );
  textChannel.send(embed);
};
