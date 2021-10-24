import { getInfo } from "ytdl-core";
import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { Song } from "../types";
import { Message } from "discord.js";
import { YTSearcher } from "../logic/YTSearcher";
import {
  playbackErrorEmbed,
  queueFinishedEmbed,
  songEmbed,
  tokenize,
} from "../utils/helpers";
import { JuanitaSubscription } from "./JuanitaSubscription";

/**
 * This is the data required to create a Track object
 */
export interface TrackData {
  song: Song;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export class Track implements TrackData {
  public song: Song;
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor({
    song,
    onStart = noop,
    onFinish = noop,
    onError = noop,
  }: TrackData) {
    this.song = song;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  public createAudioResource(url: string = this.song.url): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      const process = ytdl(
        url,
        {
          o: "-",
          q: "",
          f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
          r: "100K",
        },
        { stdio: ["ignore", "pipe", "ignore"] }
      );
      if (!process.stdout) {
        reject(new Error("No stdout"));
        return;
      }
      const stream = process.stdout;
      const onError = (error: Error) => {
        if (!process.killed) process.kill();
        stream.resume();
        reject(error);
      };
      process
        .once("spawn", () => {
          demuxProbe(stream)
            .then((probe) =>
              resolve(
                createAudioResource(probe.stream, {
                  metadata: this,
                  inputType: probe.type,
                })
              )
            )
            .catch(onError);
        })
        .catch(onError);
    });
  }

  /**
   * Creates a Track from a video URL and lifecycle callback methods.
   *
   * @param url The URL of the video
   * @param methods Lifecycle callbacks
   * @returns The created Track
   */
  public static async from(
    message: Message,
    subscription: JuanitaSubscription,
    injected: Song | undefined = undefined
  ): Promise<Track | null> {
    let song: Song | undefined;
    if (injected) {
      song = injected;
    } else {
      const { content, author } = message;
      const keywords = tokenize(content);
      const requestor = {
        tag: author.tag,
        id: author.id,
      };
      song = await YTSearcher.search(keywords, requestor);
    }

    if (!song) return null;

    // The methods are wrapped so that we can ensure that they are only called once.
    const wrappedMethods = {
      onStart() {
        wrappedMethods.onStart = noop;
        message.channel
          .send({
            embeds: [songEmbed(song!, subscription)],
          })
          .catch(console.warn);
        subscription.current = song;
      },
      onFinish() {
        wrappedMethods.onFinish = noop;
        if (subscription.queue.length == 0)
          message.channel
            .send({ embeds: [queueFinishedEmbed()] })
            .catch(console.warn);
        subscription.current = undefined;
      },
      onError(error: Error) {
        wrappedMethods.onError = noop;
        console.warn(error);
        message.channel
          .send({ embeds: [playbackErrorEmbed()] })
          .catch(console.warn);
      },
    };

    return new Track({
      song: song,
      ...wrappedMethods,
    });
  } 
}
