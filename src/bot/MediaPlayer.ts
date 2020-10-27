import {
  DMChannel,
  MessageEmbed,
  NewsChannel,
  StreamDispatcher,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Readable } from "stream";
import ytdl from "ytdl-core";
import { ISong } from "../utils/api";
import { formattedTime } from "../utils/helpers";
import { ERRORS, MESSAGES } from "../utils/messages";
import QueueConstruct from "./QueueConstruct";
import * as db from "../database/DatabaseHandler";
import JuanitaGuild from "./Guild";

export const play = async (guild: JuanitaGuild, voiceChannel: VoiceChannel) => {
  let clearedTimeout = false;
  if (guild.timeout !== undefined) {
    clearTimeout(guild.timeout);
    clearedTimeout = true;
  }
  const queue: QueueConstruct = guild.queue!;
  if (guild.connection === undefined || voiceChannel.joinable) {
    guild.connection = await voiceChannel.join();
  }
  const textChannel: TextChannel | DMChannel | NewsChannel = guild.textChannel!;
  if (queue.size() === 0 && !clearedTimeout) {
    queue.playing = false;
    queue.current = undefined;
    textChannel.send(MESSAGES.QUEUE_EMPTY);
    return;
  }

  const song: ISong = queue.next();
  if (song === undefined) return textChannel.send(ERRORS.SONG_PLAY_FAIL);
  db.addNewSong(song);
  const estimatedtime: string = formattedTime(song.length);
  const ytdl_song: Readable = ytdl(song.url, {
    filter: "audioonly",
    quality: "highestaudio",
  });

  const dispatcher: StreamDispatcher = guild
    .connection!.play(ytdl_song)
    .on("finish", async () => {
      if (queue.size() > 0) {
        await play(guild, voiceChannel);
      }
    })
    .on("error", async (error) => {
      console.log(error);
      console.log(`Playing song: ${song.title} again after error `);
      textChannel.send(ERRORS.SONG_PLAY_FAIL);
      await play(guild, voiceChannel)
      return
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
