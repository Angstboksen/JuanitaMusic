import mysql, { Connection } from "mysql";
import SETUP_CONFIG from "../config";
import { Song } from "../types";
import {
  insertIntoSearches,
  insertIntoSongs,
  selectSongByURL,
} from "./statements";

export const connectAndQuery = async (query: string) => {
  const con: Connection = mysql.createConnection(SETUP_CONFIG.db_config);
  const result = new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) reject(err);
      con.query(query, (err: any, result: any) => {
        if (err) reject(err);
        resolve(result);
        con.end();
      });
    });
  });
  return result;
};

export const addNewSong = async (song: Song) => {
  const songExists: Array<any> = (await connectAndQuery(
    selectSongByURL(song.url)
  )) as Array<any>;
  if (songExists.length === 0) {
    console.log('Not exists');
    const packet: any = await connectAndQuery(insertIntoSongs(song));
    const id = packet.insertId;
    storeSongPlayed(id, song.requestor!.id);
  } else {
    console.log("Exists");
    storeSongPlayed(songExists[0].id, song.requestor!.id);
  }
};

export const storeSongPlayed = async (id: number, author: string) => {
  const res = await connectAndQuery(insertIntoSearches(id, author));
  console.log(res);
};
