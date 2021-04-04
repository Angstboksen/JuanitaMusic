import firestoreConnection from ".";

export const showDBCollectionWithDoc = async (
  collectionName: string,
  docRef: string
) => {
  const snapshot = await firestoreConnection
    .collection(collectionName)
    .doc(docRef)
    .get();
  return snapshot.data();
};

export const existsInFirestore = async (
  collectionName: string,
  ref: string,
  value: string
) => {
  const collection = firestoreConnection.collection(`${collectionName}`);
  const snapshot = await collection.where(ref, "==", value).get();
  return snapshot.docs;
};

export const showDBCollection = async (collectionName: string) => {
  const snapshot = await firestoreConnection.collection(collectionName).get();
  const data: any[] = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
};

export const _fetchDBCollectionWithDoc = async (
  collectionName: string,
  docRef: string
) => {
  const snapshot = await firestoreConnection
    .collection(collectionName)
    .doc(docRef)
    .get();
  return snapshot.data();
};
