import { Song } from "../types";

export abstract class Logger {
  static _logCommand = (command: String, author: String) => {
    console.log(`Running command: '${command}' | By user: ${author}`);
  };

  static _logSearch = (keywords: string, try_nr: number) => {
    console.log(`Searching: ${keywords} | Try number: ${try_nr}`);
  };

  static _foundSong = (song: Song) => {
    console.log(`Found song: ${song.title}`);
  };

  static _error = (error: String) => {
    console.log(`JuanitaError -- ${error}`);
  };

  static debug = (reason: string) => {
    console.log(`Debug: ${reason}`);
  };
}
