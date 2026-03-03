import { spawn, type ChildProcess } from "child_process";
import type { Readable } from "stream";

export interface StreamResult {
  stream: Readable;
  process: ChildProcess;
}

/**
 * Get the direct audio stream URL from yt-dlp.
 */
export async function getStreamUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "-g",
      "-f", "bestaudio[acodec=opus]/bestaudio",
      "--no-playlist",
      url,
    ]);

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => (stdout += chunk));
    proc.stderr.on("data", (chunk: Buffer) => (stderr += chunk));
    proc.on("close", (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim().split("\n")[0]!);
      } else {
        reject(new Error(`yt-dlp failed (code ${code}): ${stderr.trim()}`));
      }
    });
    proc.on("error", reject);
  });
}

/**
 * Create an audio stream from a URL using yt-dlp + ffmpeg.
 * Returns raw s16le PCM at 48kHz stereo for @discordjs/voice.
 */
export async function createStream(url: string, seekSeconds = 0): Promise<StreamResult> {
  const directUrl = await getStreamUrl(url);

  const args = [
    "-reconnect", "1",
    "-reconnect_streamed", "1",
    "-reconnect_delay_max", "5",
    ...(seekSeconds > 0 ? ["-ss", String(seekSeconds)] : []),
    "-i", directUrl,
    "-analyzeduration", "0",
    "-loglevel", "0",
    "-f", "s16le",
    "-ar", "48000",
    "-ac", "2",
    "pipe:1",
  ];

  const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "ignore"] });
  return { stream: proc.stdout!, process: proc };
}
