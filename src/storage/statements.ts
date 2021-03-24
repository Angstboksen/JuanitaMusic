import { Song } from "../types";

export function selectSongByURL(url: string) {
  return `SELECT * FROM songs WHERE url = "${url}"`;
}

export function insertIntoSongs(song: Song) {
  song.title = song.title.replace(/['"]+/g, "");
  return `INSERT INTO songs (url, title, length, thumbnail) VALUES ("${song.url}", "${song.title}", ${song.seconds}, "${song.thumbnail}")`;
}

export function insertIntoSearches(song: number, author: string) {
  return `INSERT INTO searches (songid, userid, date) VALUES (${song}, "${author}", "${new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")}")`;
}
