import { db } from "../database.js";
import { history } from "../schema.js";

export async function logPlay(data: {
  guildId: string;
  title: string;
  url: string;
  durationSeconds?: number;
  requestedById: string;
  requestedByTag: string;
}) {
  await db.insert(history).values(data);
}
