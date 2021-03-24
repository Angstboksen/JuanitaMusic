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
    return this.songs[0];
  };

  size = () => {
    return this.songs.length;
  };

  inrange = (index: number) => {
    return index >= 0 && index < this.songs.length;
  };

  kill = (index: number) => {
    const song = this.songs[index];
    this.songs.splice(index, 1);
    return song;
  };

  skipTo = (index: number) => {
    const song = this.songs[index];
    this.shift(index);
    return song;
  };

  shift = (index: number) => {
    this.songs = this.songs.splice(index, this.songs.length);
  };

  enqueue = (song: Song, first: boolean = false) => {
    if (first) {
      this.songs = [song].concat(this.songs);
      return;
    }
    this.songs.push(song);
  };

  dequeue = () => {
    this.songs.shift();
  };

  clear = () => {
    this.playing = false;
    this.songs = [];
  };

  stop = () => {
    this.playing = false;
  };

  empty = () => {
    return this.size() === 0;
  };

  time = () => {
    if (this.guild.connection && this.current) {
      return Math.floor(
        this.current.seconds -
          this.guild.connection.dispatcher.totalStreamTime / 1000
      );
    }
    return this.next()!.seconds;
  };

  bar = () => {
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

  /*async show() {
    let embed = new MessageEmbed();
    let text = "";
    let count = 0;
    for (let song of this.songs) {
      if (text.length > 1500) {
        break;
      }
      count++;
      text += `**${count})** :notes:  **Tittel:** ${song.title.replace(
        /[*]+/,
        ""
      )}\n`;
    }
    text +=
      "\n :timer: **Beregnet total tid: ** " + (await this.getEstimatedTime());
    let title =
      count === 0
        ? ":scroll: **Køen er tom!** :scroll:"
        : ":scroll: **Slik ser køen ut** :scroll: | **Antall sanger: **" +
          this.size();
    embed.setTitle(title);
    embed.setDescription(text);

    return embed;
  }

  async getEstimatedTime() {
    let totalSeconds = 0;
    for (let song of this.songs) {
      totalSeconds += song.length;
    }
    return formattedTime(totalSeconds);
  }*/
}
