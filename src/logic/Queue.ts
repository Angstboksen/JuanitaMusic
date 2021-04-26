import { Song } from "../types";
import JuanitaGuild from "./JuanitaGuild";

export default class Queue {
  songs: Song[];
  playing: boolean;
  paused: boolean;
  current: Song | null;
  guild: JuanitaGuild;

  constructor(guild: JuanitaGuild, songs: Song[] = []) {
    this.songs = songs;
    this.playing = false;
    this.current = null;
    this.paused = false;
    this.guild = guild;
  }

  next = (): Song | null => {
    return this.songs[0] ? this.songs[0] : null;
  };

  size = (): number => {
    return this.songs.length;
  };

  inrange = (index: number): boolean => {
    return index >= 0 && index < this.songs.length;
  };

  kill = (index: number): Song => {
    const song = { ...this.songs[index] };
    this.songs.splice(index, 1);
    return song;
  };

  skipTo = (index: number): Song => {
    const song = { ...this.songs[index] };
    this.shift(index);
    return song;
  };

  shift = (index: number): void => {
    this.songs = this.songs.splice(index, this.songs.length);
  };

  enqueue = (song: Song, first: boolean = false): void => {
    if (first) {
      this.songs = [song].concat(this.songs);
      return;
    }
    this.songs.push(song);
  };

  dequeue = (): void => {
    this.songs.shift();
  };

  clear = (): void => {
    this.playing = false;
    this.current = null;
    this.songs = [];
  };

  stop = (): void => {
    this.playing = false;
  };

  empty = (): boolean => {
    return this.size() === 0;
  };

  time = (): number => {
    if (this.guild.connection && this.current) {
      return Math.floor(
        this.current.seconds -
          this.guild.connection.dispatcher.totalStreamTime / 1000
      );
    }
    return this.next()!.seconds;
  };

  bar = (): string => {
    let bar = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬".split("");
    const part =
      this.guild.connection!.dispatcher.totalStreamTime /
      1000 /
      this.current!.seconds;
    let index: number = Math.ceil(part * bar.length);
    if (Number.isNaN(index)) index = 0;
    bar[index] = "🔘";
    return bar.join("");
  };
}
