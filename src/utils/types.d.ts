import { IPlaylist, IQueue } from "./api";

type SetupConfig = {
  prefix: string;
  token: string | undefined;
  botid: string | undefined;
  db_config: DBConfig;
};

type DBConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
};

export type Guild = {
  id: number;
  name: string;
  playlist: IPlaylist;
  queue: IQueue;
};
