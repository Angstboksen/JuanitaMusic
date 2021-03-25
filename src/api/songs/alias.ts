import firestoreConnection from "..";
import { showDBCollection, showDBCollectionWithDoc } from "../queries";

export const aliasExists = async (alias: string) => {
  const doc = await showDBCollectionWithDoc("aliases", alias);
  return doc;
};

export const validateRemember = async (alias: string) => {
  const exists = await aliasExists(alias);
  return exists === undefined
    ? undefined
    : { alias, name: exists.name, plid: exists.plid };
};

export const rememberAlias = async (
  plid: string,
  alias: string,
  name: string
) => {
  const docRef = firestoreConnection.collection(`aliases`).doc(alias);
  docRef.set({
    alias,
    plid,
    name,
  });
};

export const retrieveAliases = async () => {
  return await showDBCollection("aliases");
};
