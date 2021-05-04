import yts from "yt-search";
import { Logger } from "../logger/Logger";
import { Song } from "../types";
import { filteredTitle } from "../utils/helpers";

export abstract class YTSearcher {
  static search = async (
    keywords: string,
    requestor: { tag: string; id: string },
    try_nr: number = 1
  ): Promise<Song | null> => {
    Logger._logSearch(keywords, try_nr);
    if (keywords === "" || try_nr == 3) {
      return null;
    }

    const obj = await yts(keywords + " lyrics").catch(() => {
      return null;
    });

    if (obj !== null && obj.videos.length > 0) {
      const { url, title, seconds, thumbnail } = obj.videos[0];
      const song: Song = {
        url,
        title: filteredTitle(title),
        seconds,
        thumbnail,
        requestor,
        isSpotify: false,
      };
      Logger._foundSong(song);
      return song;
    }

    return await YTSearcher.search(keywords, requestor, try_nr + 1);
  };
}
