import firestoreConnection from "..";
import { Song } from "../../types";
import { v4 as uuid4 } from "uuid";

export const storeSong = async (song: Song) => {
  const { title, url, seconds, thumbnail } = song;
  const id = uuid4();
  const docRef = firestoreConnection.collection("songs").doc(`${id}`);
  await docRef.set({
    title,
    url,
    seconds,
    thumbnail,
  });
  return id;
};
