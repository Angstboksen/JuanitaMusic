import { spawn } from "child_process";
import { YouTube } from "youtube-sr";
import type { Track } from "./track.js";
import { getCookiesArgs } from "./stream.js";

export interface SearchResult {
  type: "TRACK" | "PLAYLIST";
  tracks: Track[];
  playlistName?: string;
}

const SPOTIFY_REGEX = /^https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;

/**
 * Search for tracks on YouTube or resolve Spotify/YouTube URLs.
 */
export async function searchTracks(query: string, requester: any): Promise<SearchResult> {
  // Check for Spotify URL
  const spotifyMatch = query.match(SPOTIFY_REGEX);
  if (spotifyMatch) {
    return resolveSpotify(spotifyMatch[1]!, spotifyMatch[2]!, requester);
  }

  // Check for YouTube playlist URL — use yt-dlp for reliability
  if (query.includes("youtube.com/playlist") || query.includes("list=")) {
    const playlist = await fetchYtDlpPlaylist(query, requester);
    if (playlist) return playlist;
    // Fall through to single video / search
  }

  // Check for direct YouTube video URL
  if (query.includes("youtube.com/watch") || query.includes("youtu.be/")) {
    try {
      const video = await YouTube.getVideo(query);
      if (video) {
        return {
          type: "TRACK",
          tracks: [videoToTrack(video, requester)],
        };
      }
    } catch {
      // Fall through to search
    }
  }

  // General YouTube search
  const results = await YouTube.search(query, { limit: 1, type: "video" });
  if (results.length === 0) {
    return { type: "TRACK", tracks: [] };
  }

  return {
    type: "TRACK",
    tracks: [videoToTrack(results[0]!, requester)],
  };
}

function videoToTrack(video: any, requester: any): Track {
  return {
    title: video.title ?? "Unknown",
    url: video.url ?? `https://youtube.com/watch?v=${video.id}`,
    duration: video.duration ?? 0,
    thumbnail: video.thumbnail?.url ?? null,
    requester,
  };
}

// --- yt-dlp playlist fetching ---

interface YtDlpEntry {
  id: string;
  title: string;
  url?: string;
  duration?: number;
  thumbnails?: { url: string }[];
}

async function fetchYtDlpPlaylist(url: string, requester: any): Promise<SearchResult | null> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", [
      "--flat-playlist",
      "-J",
      "--no-warnings",
      "--js-runtimes", "node",
      ...getCookiesArgs(),
      url,
    ]);

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => (stdout += chunk));
    proc.stderr.on("data", (chunk: Buffer) => (stderr += chunk));

    proc.on("close", (code) => {
      if (code !== 0 || !stdout.trim()) {
        console.error(`[Search] yt-dlp playlist failed (code ${code}): ${stderr.trim()}`);
        resolve(null);
        return;
      }

      try {
        const data = JSON.parse(stdout) as { title?: string; entries?: YtDlpEntry[] };
        const entries = data.entries ?? [];
        const tracks: Track[] = entries.map((e) => ({
          title: e.title ?? "Unknown",
          url: e.url ?? `https://youtube.com/watch?v=${e.id}`,
          duration: e.duration ? e.duration * 1000 : 0,
          thumbnail: e.thumbnails?.[0]?.url ?? null,
          requester,
        }));

        console.log(`[Search] Playlist "${data.title}" loaded with ${tracks.length} tracks via yt-dlp`);
        resolve({
          type: "PLAYLIST",
          tracks,
          playlistName: data.title ?? "Unknown Playlist",
        });
      } catch (err) {
        console.error("[Search] Failed to parse yt-dlp playlist JSON:", err);
        resolve(null);
      }
    });

    proc.on("error", (err) => {
      console.error("[Search] yt-dlp spawn error:", err);
      resolve(null);
    });
  });
}

// --- Spotify resolution ---

let spotifyToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { access_token: string; expires_in: number };
  spotifyToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function spotifyFetch(path: string): Promise<any | null> {
  const token = await getSpotifyToken();
  if (!token) return null;

  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.ok ? response.json() : null;
}

async function resolveSpotify(type: string, id: string, requester: any): Promise<SearchResult> {
  if (type === "track") {
    const data = await spotifyFetch(`/tracks/${id}`);
    if (!data) return { type: "TRACK", tracks: [] };

    const searchQuery = `${data.artists?.[0]?.name ?? ""} ${data.name}`;
    return searchTracks(searchQuery, requester);
  }

  let items: { name: string; artists: { name: string }[] }[] = [];
  let playlistName = "Unknown";

  if (type === "album") {
    const data = await spotifyFetch(`/albums/${id}`);
    if (!data?.tracks?.items) return { type: "PLAYLIST", tracks: [] };
    items = data.tracks.items;
    playlistName = data.name ?? playlistName;
  } else if (type === "playlist") {
    const data = await spotifyFetch(`/playlists/${id}`);
    if (!data?.tracks?.items) return { type: "PLAYLIST", tracks: [] };
    items = data.tracks.items.map((i: any) => i.track).filter(Boolean);
    playlistName = data.name ?? playlistName;
  }

  // Resolve tracks in batches of 5
  const tracks: Track[] = [];
  const batch = items.slice(0, 100);

  for (let i = 0; i < batch.length; i += 5) {
    const chunk = batch.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async (item) => {
        const q = `${item.artists?.[0]?.name ?? ""} ${item.name}`;
        const result = await searchTracks(q, requester);
        return result.tracks[0];
      }),
    );
    tracks.push(...(results.filter(Boolean) as Track[]));
  }

  return { type: "PLAYLIST", tracks, playlistName };
}
