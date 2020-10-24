import { DMChannel, Message, NewsChannel, TextChannel, User, VoiceChannel, VoiceConnection } from "discord.js";
import JuanitaMessage from "../bot/JuanitaMessage";
import QueueConstruct from "../bot/QueueConstruct";
import { CommandEnum } from "./enums";

export interface ICommand {
  type: CommandEnum;
  run(message: Message, guild: IGuild): void;
  isValid(tokens: string[]): boolean;
  messageDispatcher: JuanitaMessage
}

export interface ISong {
  url: string;
  title: string;
  length: number;
  thumbnail: string;
}

export interface IPlaylist {
  guildid: string;
  name: string;
  songs: ISong[];
  creator: string;
  trustedusers: string[];
}

export interface IQueue {
  songs: ISong[];
  volume: number;
  playing: boolean;
  current: ISong | undefined;
}

export interface IGuild {
  textChannel: TextChannel | DMChannel | NewsChannel | undefined;
  voiceChannel: VoiceChannel | undefined;
  connection: VoiceConnection | undefined;
  id: string;
  name: string;
  playlists: IPlaylist[];
  queue: QueueConstruct | undefined;
}

export interface IUser {

}
