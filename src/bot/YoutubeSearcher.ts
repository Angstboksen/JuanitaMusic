import yts, { VideoMetadataResult } from "yt-search";
import { ISong } from "../utils/api";
import * as db from "../database/DatabaseHandler";

function matchYoutubeUrl(url: string) {
  const ytRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return url.match(ytRegex);
}

export const search = async (
  keywords: string,
  author: String,
  trynr: number = 1
): Promise<ISong | undefined> => {
  console.log(`Searching: ${keywords} | Try number: ${trynr}`);
  if (keywords === "" || trynr == 3) {
    return undefined;
  }
  const matches = matchYoutubeUrl(keywords);
  let obj: any;
  if (matches) {
    const query: string = matches[1];
    obj = await yts({ videoId: query }).catch(() => {
      return undefined;
    });
    obj = { videos: [obj] };
  } else {
    obj = await yts(keywords).catch(() => {
      return undefined;
    });
  }
  if (obj !== undefined && obj.videos.length > 0) {
    const first = obj.videos[0];
    const song: ISong = {
      url: first.url,
      title: first.title,
      length: first.seconds,
      thumbnail: first.thumbnail,
      author: author,
    };
    db.addNewSong(song, author);
    return song;
  }
  return search(keywords, author, trynr + 1);
};
