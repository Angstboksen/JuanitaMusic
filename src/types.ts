import { CommandMessage } from "@typeit/discord";

export interface JuanitaCommand {
  execute: (command: CommandMessage) => void;
}

export type Song = {
  title: string;
  seconds: number;
  url: string;
  requestor: {
    tag: string;
    id: string;
  };
  thumbnail?: string;
  isSpotify: boolean;
};
