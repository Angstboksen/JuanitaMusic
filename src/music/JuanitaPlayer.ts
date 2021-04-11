import { StreamDispatcher } from "discord.js";
import { Readable } from "stream";
import ytdl from "ytdl-core";
import { storeSearch } from "../api/songs/search";
import { Logger } from "../logger/Logger";
import JuanitaGuild from "../logic/JuanitaGuild";
import { YTSearcher } from "../logic/YTSearcher";
import { addNewSong } from "../storage/storage";
import { Song } from "../types";
import {
  createErrorEmbed,
  emptyQueueEmbed,
  leaveEmbed,
  queueFinishedEmbed,
  skipSongEmbed,
  songEmbed,
} from "../utils/helpers";

export abstract class JuanitaPlayer {
  static guild: JuanitaGuild;

  static dispatchStream = (stream: Readable, song: Song) => {
    const { guild, play, skip, songEnd } = JuanitaPlayer;
    const { connection, queue, textChannel, send } = guild;
    if (guild.dispatcher) {
      guild.dispatcher.end();
      guild.dispatcher = null;
    }

    queue.dequeue();

    guild.dispatcher = connection!.play(stream);
    guild.dispatcher.on("start", async () => {
      addNewSong(song); // MySQL
      storeSearch(song); // Firebase
      queue.playing = true;
      queue.current = song;
      if (textChannel) send(songEmbed(song, queue, song.seconds));
    });

    guild.dispatcher.on("error", (error: Error) => {
      Logger._error(error.message);
      send(leaveEmbed());
      guild.leave();
    });

    guild.dispatcher.on("finish", () => {
      JuanitaPlayer.songEnd(guild);
    });

    guild.dispatcher.on("end", (reason: string) => {
      Logger.debug(reason);
    });
  };

  static songEnd = (guild: JuanitaGuild) => {
    if (guild.dispatcher) {
      setTimeout(() => {
        guild.queue.playing = false;
        guild.dispatcher = null;
        guild.connection = null;
        JuanitaPlayer.play(guild);
      }, 1000);
    }
  };

  static play = async (guild: JuanitaGuild) => {
    JuanitaPlayer.guild = guild;
    const { queue, validateConnection, send, leave } = JuanitaPlayer.guild;

    let song = queue.next();
    // Queue empty, leave the channel
    if (song === null || song === undefined) {
      send(queueFinishedEmbed());
      return leave();
    }

    await validateConnection();

    if (song.isSpotify || !song.url) {
      song = await YTSearcher.search(song.title, song.requestor!);
      if (song === null) {
        return JuanitaPlayer.skip(guild);
      }
    }

    const stream: Readable = ytdl(song.url, {
      filter: "audioonly",
      quality: "highestaudio",
    });
    JuanitaPlayer.dispatchStream(stream, song);
  };

  static skip = (guild: JuanitaGuild) => {
    const { connection, send } = guild;
    if (!connection || !connection.dispatcher) {
      Logger.debug("Can't skip `undefined` connection");
      send(emptyQueueEmbed());
      return;
    }
    if (!guild.queue.empty()) send(skipSongEmbed());
    connection.dispatcher.end();
  };
}
