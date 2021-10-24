import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import base64 from "base-64";
import SpotifyWebApi from "spotify-web-api-node";
import SETUP_CONFIG from "../config";
import { Logger } from "../logger/Logger";
import { filteredTitle } from "../utils/helpers";

const { spotify_id, spotify_secret } = SETUP_CONFIG;
const emptyObj = {
  statusCode: 400,
  body: { name: "", items: [] },
};

export class SpotifySearcher {
  static api: SpotifyWebApi = new SpotifyWebApi({
    clientId: spotify_id,
    clientSecret: spotify_secret,
    redirectUri: "https://angstboksen.no",
  });
  static interval: NodeJS.Timeout | undefined = setInterval(async () => {
    await SpotifySearcher.getToken();
  }, 3000000);

  static findPlaylist = async (playlistid: string) => {
    if (SpotifySearcher.api.getAccessToken() === undefined) {
      await SpotifySearcher.getToken();
    }
    const response = await SpotifySearcher.api
      .getPlaylist(playlistid)
      .catch((error: Error) => {
        return { statusCode: 400, body: { name: "_default_" } };
      });
    return { statusCode: response.statusCode, name: response.body.name };
  };

  static getToken = async () => {
    const data = new URLSearchParams();
    data.append("grant_type", "client_credentials");
    const encoded = base64.encode(`${spotify_id}:${spotify_secret}`);
    const config: AxiosRequestConfig = {
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data,
    };
    const response = (await axios(config).catch((error: Error) => {
      Logger._error(error.message);
    })) as AxiosResponse<any>;
    if (response.status === 200) {
      const { access_token } = response.data;
      SpotifySearcher.api.setAccessToken(access_token);
      Logger.debug("Fetched new token: " + access_token);
      return access_token;
    }
    return undefined;
  };

  static fetchPlaylist = async (
    playlistid: string,
    offset: number = 0,
    carry: any[] = []
  ): Promise<{ statusCode: number; items: any[] }> => {
    const response = await SpotifySearcher.api
      .getPlaylistTracks(playlistid, { offset })
      .catch((error: Error) => {
        return emptyObj;
      });
    if (response.statusCode !== 200) {
      return { statusCode: response.statusCode, items: [] };
    }
    let items = carry.concat([carry].concat(response.body.items));
    if (response.body.items.length >= 100) {
      return SpotifySearcher.fetchPlaylist(playlistid, offset + 100, items);
    }
    return { statusCode: 200, items };
  };

  static searchPlaylist = async (
    playlistid: string,
    requestor: { tag: string; id: string }
  ) => {
    if (SpotifySearcher.api.getAccessToken() === undefined) {
      await SpotifySearcher.getToken();
    }
    const { name } = (
      await SpotifySearcher.api.getPlaylist(playlistid).catch((error: Error) => {
        return emptyObj;
      })
    ).body;
    const pl: { statusCode: number; items: any[] } = await SpotifySearcher.fetchPlaylist(
      playlistid
    );
    if (pl.statusCode === 200) {
      const tracks = [];
      for (const item of pl.items) {
        if (item.track === undefined) continue;
        const {
          name,
          duration_ms,
          artists,
          external_urls: { spotify },
        } = item.track;
        const title = filteredTitle(
          ` ${name} by ${artists.map(
            (artist: { name: string }) => `${artist.name}`
          )}`
        );
        tracks.push({
          title,
          seconds: Math.floor(duration_ms / 1000),
          url: spotify,
          requestor: { tag: requestor.tag, id: requestor.id },
          isSpotify: true,
        });
      }
      return { name, tracks };
    }
    return undefined;
  };
}
