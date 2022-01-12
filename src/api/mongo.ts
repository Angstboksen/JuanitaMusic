import { Db, MongoClient } from "mongodb";
import { Search, Song } from "../types";

// Create a new MongoClient
const client = new MongoClient(process.env.MONGOURL!);
client.connect();

export const mongoStoreSearch = async (song: Song | null) => {
  if (!song) return;
  const db = client.db("juanitamusic");
  const songExists = await mongoExistsSong(song, db);
  const requestorExists = await mongoExistsRequestor(song.requestor, db);
  if (!songExists) {
    const nSong = {
      title: song.title,
      url: song.url,
      seconds: song.seconds,
      thumbnail: song.thumbnail,
    };
    await db.collection("songs").insertOne(nSong);
  }
  if (!requestorExists) {
    await db.collection("requestors").insertOne(song.requestor);
  }

  const search: Search = {
    title: song.title,
    requestor: song.requestor,
    date: new Date(),
  };
  await db.collection("searches").insertOne(search);
};

export const mongoStoreAlias = async (
  plid: string,
  alias: string,
  name: string
) => {
  const db = client.db("juanitamusic");
  await db.collection("aliases").insertOne({ alias, plid, name });
};

export const mongoExistsSong = async (song: Song, db: Db) => {
  try {
    const exists = await db
      .collection("songs")
      .find({ url: song.url })
      .toArray();
    return exists.length > 0;
  } catch (err) {
    return false;
  }
};

export const mongoExistsRequestor = async (
  requestor: {
    tag: string;
    id: string;
  },
  db: Db
) => {
  try {
    const exists = await db
      .collection("requestors")
      .find({ id: requestor.id })
      .toArray();
    return exists.length > 0;
  } catch (err) {
    return false;
  }
};

export const mongoExistsAlias = async (alias: String) => {
  try {
    const exists = await client
      .db("juanitamusic")
      .collection("aliases")
      .find({ alias: alias })
      .toArray();
    return exists[0];
  } catch (err) {
    return undefined;
  }
};

export const mongoRetrieveAliases = async () => {
  try {
    const exists = await client
      .db("juanitamusic")
      .collection("aliases")
      .find({})
      .toArray();
    return (exists ? exists : []) as any[];
  } catch (err) {
    return undefined;
  }
};
