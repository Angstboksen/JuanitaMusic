import { Db, MongoClient } from "mongodb";
import { Search, Song } from "../../types";

// Create a new MongoClient
const client = new MongoClient(process.env.MONGOURL!, {
  useUnifiedTopology: true,
});
export const mongoStoreSearch = async (song: Song | null) => {
  if (!song) return;
  client.connect(async () => {
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
    await client.close();
  });
};

export const mongoStoreAlias = (plid: string, alias: string, name: string) => {
  client.connect(async () => {
    const db = client.db("juanitamusic");
    await db.collection("aliases").insertOne({ alias, plid, name });
    client.close();
  });
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

export const mongoExistsAlias = async (alias: string, db: Db) => {
  try {
    const exists = await db.collection("aliases").find({ alias }).toArray();
    return exists.length > 0;
  } catch (err) {
    return false;
  }
};
