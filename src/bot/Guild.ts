import { IGuild, IPlaylist, IQueue } from "../utils/api";
import * as db from "../database/DatabaseHandler";
import { DMChannel, NewsChannel, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import QueueConstruct from "./QueueConstruct";
import Playlist from "./Playlist";

export default class JuanitaGuild implements IGuild {
  id: string;
  textChannel: TextChannel | DMChannel | NewsChannel | undefined;
  voiceChannel: VoiceChannel | undefined;
  connection: VoiceConnection | undefined;
  name: string;
  playlists: Playlist[];
  queue: QueueConstruct | undefined;
  timeout: NodeJS.Timeout | undefined

  constructor(id: string, name: string, playlists: Playlist[] = []) {
    this.textChannel = undefined
    this.voiceChannel = undefined;
    this.id = id;
    this.name = name;
    this.playlists = playlists;
    this.connection = undefined;
    this.queue = undefined;
    this.timeout =  undefined
  }

  addPlaylist(playlist: Playlist) {
    this.playlists.push(playlist);
    this.timeout = undefined
    db.addNewPlaylistToGuild(playlist);
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
    return undefined;
  }

  petBot(sender: string) {
    db.petBot(this.id, sender);
  }
}
