import * as db from "../database/DatabaseHandler";
import { IPlaylist, ISong } from "../utils/api";
import {shuffleArray} from '../utils/helpers'


class Playlist implements IPlaylist {
  guildid: string;
  name: string;
  songs: ISong[];
  creator: string;
  trustedusers: string[];

  constructor(
    guildid: string,
    name: string,
    songs: ISong[],
    creator: string,
    trustedusers: string[]
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

  addSong(song: ISong) {
    if (!this.hasSong(song.url)) {
      console.log(`Song added: ${song.title}`);
      this.songs.push(song);
      db.addNewSongToPlaylist(this, song);
    }
  }

  removeSong(index: number) {
    const song = this.songs[index];
    this.songs.splice(index, 1);
    db.deleteSongFromList(this.guildid, this.name, song.url);
    return song;
  }

  addTrustedUser(user: string) {
    if (!this.trustedusers.includes(user)) {
      this.trustedusers.push(user);
      db.addTrusteduserToPlaylist(this, user);
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
    return shuffle ? this.shuffle() : this.songs;
  }

  shuffle() {
    let temp: ISong[] = this.songs;
    return shuffleArray(temp) as ISong[];
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
