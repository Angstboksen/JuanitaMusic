import {IPlaylist, IQueue} from './api'

type SetupConfig = {
  prefix: string;
  token: string | undefined;
  botid: string | undefined;
};

export type Guild = {
  id: number;
  name: string;
  playlist: IPlaylist;
  queue:  IQueue;
};
