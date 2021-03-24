import { StreamDispatcher } from "discord.js";
import { Readable } from "stream";
import ytdl from "ytdl-core";
import { Logger } from "../logger/Logger";
import JuanitaGuild from "../logic/JuanitaGuild";
import { YTSearcher } from "../logic/YTSearcher";
import { addNewSong } from "../storage/storage";
import { Song } from "../types";
import {
  createErrorEmbed,
  queueFinishedEmbed,
  skipSongEmbed,
  songEmbed,
} from "../utils/helpers";

export abstract class JuanitaPlayer {
  static dispatcher?: StreamDispatcher | null;
  static guild: JuanitaGuild;

  static dispatchStream = (stream: Readable, song: Song) => {
    if (JuanitaPlayer.dispatcher) {
      JuanitaPlayer.dispatcher.end();
      JuanitaPlayer.dispatcher = null;
    }

    const { guild, play, skip, songEnd } = JuanitaPlayer;
    const { connection, queue, textChannel, send } = guild;
    queue.dequeue();

    JuanitaPlayer.dispatcher = connection!.play(stream);
    JuanitaPlayer.dispatcher.on("start", async () => {
      addNewSong(song);
      queue.playing = true;
      queue.current = song;
      if (textChannel) send(songEmbed(song, queue, song.seconds));
    });

    JuanitaPlayer.dispatcher.on("error", (error: Error) => {
      JuanitaPlayer.skip(guild);
      Logger._error(error.message);
      if (textChannel) send(createErrorEmbed(`Error Playing Song: ${error}`));
    });

    JuanitaPlayer.dispatcher.on("finish", () => {
      JuanitaPlayer.songEnd(guild);
    });

    JuanitaPlayer.dispatcher.on("end", (reason: string) => {
      Logger.debug(reason);
    });
  };

  static songEnd = (guild: JuanitaGuild) => {
    if (JuanitaPlayer.dispatcher) {
      setTimeout(() => {
        guild.queue.playing = false;
        JuanitaPlayer.dispatcher = null;
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
      return;
    }
    if (!guild.queue.empty()) send(skipSongEmbed());
    connection.dispatcher.end();
  };
}

