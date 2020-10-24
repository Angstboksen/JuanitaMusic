import { IGuild, IPlaylist, IQueue } from "../utils/api";
import * as db from "../database/DatabaseHandler";
import { DMChannel, NewsChannel, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import QueueConstruct from "./QueueConstruct";

export default class JuanitaGuild implements IGuild {
  id: string;
  textChannel: TextChannel | DMChannel | NewsChannel | undefined;
  voiceChannel: VoiceChannel | undefined;
  connection: VoiceConnection | undefined;
  name: string;
  playlists: IPlaylist[];
  queue: QueueConstruct | undefined;

  constructor(id: string, name: string, playlists: IPlaylist[] = []) {
    this.textChannel = undefined
    this.voiceChannel = undefined;
    this.id = id;
    this.name = name;
    this.playlists = playlists;
    this.connection = undefined;
    this.queue = undefined;
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
    db.deleteListFromGuild(this.id, playlistname);
  }

  getPlaylistByName(playlistname: string) {
    for (let list of this.playlists) {
      if (list.name === playlistname) {
        return list;
      }
    }
    return null;
  }

  petBot(sender: string) {
    db.petBot(this.id, sender);
  }
}
