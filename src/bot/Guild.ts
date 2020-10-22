import { User } from "discord.js";
import { IPlaylist, IQueue } from "../utils/api";

class Guild {
  id: number;
  name: string;
  playlists: IPlaylist[];
  //queue: IQueue;

  constructor(id: number, name: string, playlists: IPlaylist[] = []) {
    this.id = id;
    this.name = name;
    this.playlists = playlists;
    /*this.queue = new QueueConstruct(null, null, null);
    db.addNewGuild(id, name);*/
  }

  addPlaylist(playlist: IPlaylist) {
    this.playlists.push(playlist);
    //db.addNewPlaylistToGuild(playlist);
    return true;
  }

  removePlaylist(playlistname: string) {
    let index = 0;
    for (let list of this.playlists) {
      if (list.name === playlistname) {
        break;
      }
      index++;
    }
    this.playlists.splice(index, 1);
    //db.deleteListFromGuild(this.id, playlistname);
  }

  getPlaylistByName(playlistname: string) {
    for (let list of this.playlists) {
      if (list.name === playlistname) {
        return list;
      }
    }
    return null;
  }

  petBot(sender: User) {
    //db.petBot(this.id, sender);
  }
}
