import { MessageEmbed} from "discord.js";
import { IQueue, ISong } from "../utils/api";
import { formattedTime } from "../utils/helpers";

export default class QueueConstruct implements IQueue {
  songs: ISong[];
  volume: number;
  playing: boolean;
  current: ISong | undefined;

  constructor(
    songs: ISong[] = []
  ) {
    this.songs = songs;
    this.volume = 5;
    this.playing = false;
    this.current = undefined;
  }

  next() {
    this.current = this.songs[0];
    return this.current;
  }

  size() {
    return this.songs.length;
  }

  inrange(index: number) {
    return index > 0 && index <= this.songs.length;
  }

  shift(index: number) {
    this.songs = this.songs.splice(index - 1, this.songs.length);
  }

  enqueue(song: ISong, first: boolean = false) {
    if (first) {
      this.songs = [song].concat(this.songs);
      return;
    }
    this.songs.push(song);
  }

  dequeue() {
    this.songs.shift();
  }

  clear() {
    this.playing = false;
    this.songs = [];
  }
  async show() {
    let embed = new MessageEmbed();
    let text = "";
    let count = 0;
    for (let song of this.songs) {
      if (text.length > 1500) {
        break;
      }
      count++;
      text += `**${count})** :notes: **Tittel:** ${song.title.replace(/[*]+/, "")}\n`;
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
    return formattedTime(totalSeconds)
  }
}
