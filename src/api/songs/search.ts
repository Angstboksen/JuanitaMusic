import firestoreConnection from "..";
import { Song } from "../../types";
import { existsInFirestore, showDBCollectionWithDoc } from "../queries";
import { storeSong } from "./song";

export const storeSearch = async (song: Song) => {
  const { title, url, requestor } = song;
  const docRef = firestoreConnection.collection(`searches`).doc();
  const spesSearchDocRef = firestoreConnection
    .collection("requestors")
    .doc(requestor.id)
    .collection("searches");
  const pDocRef = firestoreConnection.collection("specials").doc("playtime");
  const rpDocRef = firestoreConnection
    .collection("requestors")
    .doc(requestor.id);
  const playtime = await showDBCollectionWithDoc("specials", "playtime");
  const req = await showDBCollectionWithDoc("requestors", requestor.id);
  const exist = await existsInFirestore(`songs`, `url`, url);
  let id;
  if (exist.length === 0) {
    id = await storeSong(song);
  } else {
    id = exist[0].ref.id;
  }

  const search = {
    title,
    song: firestoreConnection.doc(`songs/${id}`),
    requestor,
    date: new Date().toISOString(),
  };

  await docRef.set(search);
  await pDocRef.set({
    seconds: playtime!.seconds + song.seconds,
  });
  await rpDocRef.set({
    id: requestor.id,
    tag: requestor.tag,
    plays: req!.plays === undefined ?  1 : req!.plays + 1,
  });
  await spesSearchDocRef.add(search);
};
