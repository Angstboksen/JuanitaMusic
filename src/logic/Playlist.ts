import { Song } from "../types";
import { shuffleArray } from "../utils/helpers";

export class Playlist {
  guildid: string;
  name: string;
  songs: Song[];
  creator: string;
  trustedusers: string[];

  constructor(
    guildid: string,
    name: string,
    creator: string,
    songs: Song[] = [],
    trustedusers: string[] = []
  ) {
    this.guildid = guildid;
    this.name = name;
    this.songs = songs;
    this.creator = creator;
    this.trustedusers = trustedusers;
  }

  hasSong(url: string) {
    for (let song of this.songs) {
      if (song.url === url) {
        return true;
      }
    }
    return false;
  }

  addSong(song: Song) {
    if (!this.hasSong(song.url)) {
      console.log(`Song added: ${song.title}`);
      this.songs.push(song);
    }
  }

  removeSong(index: number) {
    const song = this.songs[index];
    this.songs.splice(index, 1);
    return song;
  }

  addTrustedUser(user: string) {
    if (!this.trustedusers.includes(user)) {
      this.trustedusers.push(user);
      return true;
    }
    return false;
  }

  trusts(sender: string) {
    for (let trusted of this.trustedusers) {
      if (trusted === sender) {
        return true;
      }
    }
    return false;
  }

  getSongs(shuffle: boolean) {
    return shuffle ? this.shuffle() : [...this.songs];
  }

  shuffle() {
    let temp: Song[] = [...this.songs];
    return shuffleArray(temp) as Song[];
  }

  size() {
    return this.songs.length;
  }

  clear() {
    for (let i = 0; i < this.size(); i++) {
      this.removeSong(i);
    }
  }
}

export default Playlist;
