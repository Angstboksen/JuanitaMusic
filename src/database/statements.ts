import { User } from "discord.js";
import { PlaylistItem } from "yt-search";
import { IPlaylist, ISong } from "../utils/api";

export function selectAllGuilds() {
  return "SELECT * FROM guilds";
}

export function selectGuildById(guildid: string) {
  return `SELECT * FROM guilds WHERE guildid = "${guildid}"`;
}

export function selectAllPlaylistsInGuild(guildid: string) {
  return `SELECT * FROM playlists WHERE guildid = "${guildid}"`;
}

export function selectSongByURL(url: string) {
  return `SELECT * FROM songs WHERE url = "${url}"`;
}

export function selectPlaylistByNameAndGuildId(name: string, guildid: string) {
  return `SELECT * FROM playlists WHERE name = "${name}" AND guildid = "${guildid}"`;
}

export function selectSongInPlaylist(url: string, playlistid: string) {
  return `SELECT * FROM songinplaylist WHERE songurl = "${url}" AND playlistid = "${playlistid}"`;
}

export function selectSongUrlInPlaylists(playlistid: string) {
  return `SELECT * FROM songinplaylist WHERE playlistid = "${playlistid}"`;
}

export function selectTrustedusersByPlaylistId(playlistid: string) {
  return `SELECT * FROM trustedusers WHERE playlistid = "${playlistid}"`;
}

export function selectAllSongsFromPlaylist(playlistid: string) {
  return `SELECT * FROM songsinplaylist WHERE playlistid = "${playlistid}"`;
}

export function insertIntoGuilds(id: string, name: string) {
  return `INSERT INTO guilds (guildid, name) VALUES (${id}, "${name}")`;
}

export function insertPet(guildid: string, sender: string) {
  return `INSERT INTO pets (guildid, userid) VALUES ("${guildid}", "${sender}")`;
}

export function insertIntoPlaylists(playlist: IPlaylist) {
  return `INSERT INTO playlists (name, creator, guildid) VALUES ("${playlist.name}", "${playlist.creator}", ${playlist.guildid})`;
}

export function insertIntoSongs(song: ISong) {
  song.title = song.title.replace(/['"]+/g, "")
  song.title = song.title.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
  return `INSERT INTO songs (url, title, length, thumbnail) VALUES ("${song.url}", "${song.title}", ${song.length}, "${song.thumbnail}")`;
}

export function insertIntoSongInPLaylist(songurl: string, playlistid: string) {
  return `INSERT INTO songinplaylist (songurl, playlistid) VALUES ("${songurl}", "${playlistid}")`;
}

export function insertIntoTrustedusers(playlistid: string, userid: string) {
  return `INSERT INTO trustedusers (playlistid, userid) VALUES ("${playlistid}", "${userid}")`;
}

export function insertIntoSearches(song: number, author: String) {
  return `INSERT INTO searches (songid, userid) VALUES (${song}, "${author}")`;
}

export function deleteSongInList(playlistid: string, songurl: string) {
  return `DELETE FROM songinplaylist WHERE songurl = "${songurl}" AND playlistid = "${playlistid}"`;
}

export function deletePlaylistFromGuild(guildid: string, playlistname: string) {
  return `DELETE FROM playlists WHERE guildid = "${guildid}" AND name = "${playlistname}"`;
}