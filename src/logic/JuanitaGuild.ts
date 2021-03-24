import {
  GuildMember,
  MessageEmbed,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { Playlist } from "./Playlist";
import Queue from "./Queue";

export default class JuanitaGuild {
  id: string;
  name: string;
  textChannel: TextChannel | null = null;
  voiceChannel: VoiceChannel | null = null;
  connection: VoiceConnection | null = null;
  playlists: Playlist[];
  queue: Queue = new Queue(this);

  constructor(id: string, name: string, playlists: Playlist[] = []) {
    this.id = id;
    this.name = name;
    this.playlists = playlists;
  }

  addPlaylist = (playlist: Playlist) => {
    this.playlists.push(playlist);
    return true;
  };

  validateConnection = async () => {
    if (this.connection === null || this.voiceChannel === null) {
      await this.connect();
    }
  };

  connect = async () => {
    this.connection = await this.voiceChannel!.join();
  };

  leave = () => {
    this.queue = new Queue(this);
    this.voiceChannel!.leave();
    this.connection = null;
    this.voiceChannel = null;
    if (JuanitaPlayer.dispatcher !== null) {
      JuanitaPlayer.dispatcher.destroy();
    }
    JuanitaPlayer.dispatcher = null;
  };

  send = (msg: string | MessageEmbed) => {
    this.textChannel!.send(msg);
  };

  join = async (member: GuildMember) => {
    this.voiceChannel = member.voice.channel;
    await this.connect();
  };
  /*removePlaylist(playlistname: string) {
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
  }*/
}
