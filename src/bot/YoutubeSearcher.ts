import yts from "yt-search";
import { ISong } from "../utils/api";

export const search = async (
  keywords: string,
  trynr: number = 1
): Promise<ISong | undefined> => {
  console.log(`Searching: ${keywords} | Try number: ${trynr}`);
  if (keywords === "" || trynr == 3) {
    return undefined;
  }
  const obj = await yts(keywords).catch(() => {
    return undefined;
  });
  if (obj !== undefined && obj.videos.length > 0) {
    const first = obj.videos[0];
    const song: ISong = {
      url: first.url,
      title: first.title,
      length: first.seconds,
      thumbnail: first.thumbnail,
    };
    return song;
  }
  return search(keywords, trynr + 1);
};
