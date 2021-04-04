import firestoreConnection from "..";
import { Song } from "../../types";
import { existsInFirestore, showDBCollectionWithDoc } from "../queries";
import { storeSong } from "./song";

export const storeSearch = async (song: Song) => {
  const { title, url, requestor } = song;
  const docRef = firestoreConnection.collection(`searches`).doc();
  const pDocRef = firestoreConnection.collection("specials").doc("playtime");
  const playtime = await showDBCollectionWithDoc("specials", "playtime");
  const exist = await existsInFirestore(`songs`, `url`, url);
  let id;
  if (exist.length === 0) {
    id = await storeSong(song);
  } else {
    id = exist[0].ref.id;
  }
  await docRef.set({
    title,
    song: firestoreConnection.doc(`songs/${id}`),
    requestor,
    date: new Date().toISOString(),
  });
  await pDocRef.set({
    seconds: playtime!.seconds + song.seconds,
  });
};
