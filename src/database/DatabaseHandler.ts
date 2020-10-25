import mysql, { Connection } from "mysql";
import Guild from "../bot/Guild";
import Playlist from "../bot/Playlist";
import SETUP_CONFIG from "../config";
import { IGuild, IPlaylist, ISong } from "../utils/api";
import * as statements from "./statements";

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

export const initializeGuilds = async () => {
  console.log("Fetching data from database!");
  let guilds: Map<string, IGuild> = new Map();
  try {
    let guildlist = await getAllGuilds();
    for (let guild of guildlist) {
      let newg: Guild = new Guild(guild.guildid, guild.name);
      const playlists = await getPlaylistsByGuildId(guild.guildid);
      for (let playlist of playlists) {
        const songitems = await getSongsInPlaylist(playlist.playlistid);
        let songlist: ISong[] = [];
        for (let s of songitems) {
          let songitem = await getSongByUrl(s.songurl);
          let song_item = songitem[0];
          const song: ISong = {
            url: song_item.url,
            title: song_item.title,
            length: song_item.length,
            thumbnail: song_item.thumbnail,
          };
          songlist.push(song);
        }
        const trusteditems = await getTrustedUsers(playlist.playlistid);
        let trusted_users = [playlist.creator];
        for (let t of trusteditems) {
          trusted_users.push(t.userid);
        }
        const newpl: Playlist = new Playlist(
          guild.guildid,
          playlist.name,
          songlist,
          playlist.creator,
          trusted_users
        );
        newg.addPlaylist(newpl);
      }
      guilds.set(guild.guildid, newg);
    }
    console.log("Guilds fetched and initialized!");
    console.log(
      "Using database: " +
        SETUP_CONFIG.db_config.database +
        " from host: " +
        SETUP_CONFIG.db_config.host
    );
    return guilds;
  } catch (e) {
    console.log("An error occured when fetching data");
    return new Map();
  }
};

export const addNewGuild = async (id: string, name: string) => {
  const existing: Array<any> = (await connectAndQuery(
    statements.selectGuildById(id)
  )) as Array<IGuild>;
  if (existing.length !== 0) {
    const result = await connectAndQuery(statements.insertIntoGuilds(id, name));
    return result;
  }
  return null;
};

export const addNewSong = async (song: ISong) => {
  const songExists: Array<any> = (await connectAndQuery(
    statements.selectSongByURL(song.url)
  )) as Array<any>;
  if (songExists.length === 0) {
    await connectAndQuery(statements.insertIntoSongs(song));
  }
};

export const addNewPlaylistToGuild = async (playlist: IPlaylist) => {
  const playlistInGuild: Array<any> = (await connectAndQuery(
    statements.selectPlaylistByNameAndGuildId(playlist.name, playlist.guildid)
  )) as Array<any>;
  if (playlistInGuild.length === 0) {
    return await connectAndQuery(statements.insertIntoPlaylists(playlist));
  }
};
export const addNewSongToPlaylist = async (
  playlist: IPlaylist,
  song: ISong
) => {
  const songExists: Array<any> = (await connectAndQuery(
    statements.selectSongByURL(song.url)
  )) as Array<any>;
  const result: Array<any> = (await connectAndQuery(
    statements.selectPlaylistByNameAndGuildId(playlist.name, playlist.guildid)
  )) as Array<any>;
  const playlistid = result[0].playlistid;

  if (songExists.length === 0) {
    await connectAndQuery(statements.insertIntoSongs(song));
    return await connectAndQuery(
      statements.insertIntoSongInPLaylist(song.url, playlistid)
    );
  }

  const songInList: Array<any> = (await connectAndQuery(
    statements.selectSongInPlaylist(song.url, playlistid)
  )) as Array<any>;
  if (songInList.length === 0) {
    return await connectAndQuery(
      statements.insertIntoSongInPLaylist(song.url, playlistid)
    );
  }
};
export const addTrusteduserToPlaylist = async (
  playlist: IPlaylist,
  user: string
) => {
  let result: Array<any> = (await connectAndQuery(
    statements.selectPlaylistByNameAndGuildId(playlist.name, playlist.guildid)
  )) as Array<any>;
  const playlistid = result[0].playlistid;
  result = (await connectAndQuery(
    statements.selectTrustedusersByPlaylistId(playlistid)
  )) as Array<any>;

  let alreadyTrusted = [];
  for (let trusted of result) {
    alreadyTrusted.push(trusted.userid);
  }

  if (!alreadyTrusted.includes(user)) {
    return await connectAndQuery(
      statements.insertIntoTrustedusers(playlistid, user)
    );
  }
};

export const petBot = async (guildid: string, sender: string) => {
  await connectAndQuery(statements.insertPet(guildid, sender));
};

export const getAllGuilds = async (): Promise<Array<any>> => {
  const result: Array<any> = (await connectAndQuery(
    statements.selectAllGuilds()
  )) as Array<any>;
  return result;
};

export const getPlaylistsByGuildId = async (
  guildid: string
): Promise<Array<any>> => {
  const result: Array<any> = (await connectAndQuery(
    statements.selectAllPlaylistsInGuild(guildid)
  )) as Array<any>;
  return result;
};

export const getSongsInPlaylist = async (
  playlistid: string
): Promise<Array<any>> => {
  const result: Array<any> = (await connectAndQuery(
    statements.selectSongUrlInPlaylists(playlistid)
  )) as Array<any>;
  return result;
};

export const getSongByUrl = async (url: string): Promise<Array<any>> => {
  const result: Array<any> = (await connectAndQuery(
    statements.selectSongByURL(url)
  )) as Array<any>;
  return result;
};

export const getTrustedUsers = async (
  playlistid: string
): Promise<Array<any>> => {
  const result: Array<any> = (await connectAndQuery(
    statements.selectTrustedusersByPlaylistId(playlistid)
  )) as Array<any>;
  return result;
};

export const deleteSongFromList = async (
  guildid: string,
  playlistname: string,
  songurl: string
) => {
  let initial: Array<any> = (await connectAndQuery(
    statements.selectPlaylistByNameAndGuildId(playlistname, guildid)
  )) as Array<any>;
  const playlistid = initial[0].playlistid;
  const result = await connectAndQuery(
    statements.deleteSongInList(playlistid, songurl)
  );
  return result;
};

export const deleteListFromGuild = async (
  guildid: string,
  playlistname: string
) => {
  const result = await connectAndQuery(
    statements.deletePlaylistFromGuild(guildid, playlistname)
  );
  return result;
};
