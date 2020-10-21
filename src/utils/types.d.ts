import { Channel, DMChannel, NewsChannel, TextChannel } from "discord.js";

type SetupConfig = {
  prefix: string;
  token: string | undefined;
};

export type Guild = {
  id: number;
  name: string;
  playlist: Playlist;
  queue: Queue;
}

export type Playlist = {}

export type Queue = {}

