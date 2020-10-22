import { Message, TextChannel, User, VoiceChannel } from "discord.js";
import { CommandEnum } from "./enums";

export interface ICommand {
  type: CommandEnum;
  run(message: Message, guild: IGuild): void;
  isValid(tokens: string[]): boolean;
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
  trustedusers: User[];
}

export interface IQueue {
  textChannel: TextChannel;
  voiceChannel: VoiceChannel;
  songs: ISong[];
  volume: number;
  playing: boolean;
  current: ISong | undefined;
}

export interface IGuild {
  id: string;
  name: string;
  playlists: IPlaylist[];
  //queue: IQueue;
}
