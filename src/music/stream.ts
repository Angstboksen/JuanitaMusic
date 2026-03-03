import { spawn, type ChildProcess } from "child_process";
import { writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { Readable } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface StreamResult {
  stream: Readable;
  process: ChildProcess;
}

const RUNTIME_COOKIES_PATH = "/tmp/yt-cookies.txt";
// cookies.txt in project root (gitignored)
const LOCAL_COOKIES_PATH = resolve(__dirname, "../../cookies.txt");

function getCookiesArgs(): string[] {
  // Already written from a previous call
  if (existsSync(RUNTIME_COOKIES_PATH)) return ["--cookies", RUNTIME_COOKIES_PATH];

  // Local cookies.txt file (for dev or Docker with COPY)
  if (existsSync(LOCAL_COOKIES_PATH)) {
    console.log("[Stream] Using local cookies.txt");
    return ["--cookies", LOCAL_COOKIES_PATH];
  }

  // Env var fallback (for Railway / cloud hosting)
  if (process.env.YT_COOKIES) {
    let content = process.env.YT_COOKIES.trim();
    // Fix tabs that may have been mangled to spaces by hosting platforms
    if (content.startsWith("#") && !content.includes("\t")) {
      content = content.replace(/^([^#\n].+)$/gm, (line) => {
        return line.replace(/ {2,}/g, "\t");
      });
    }
    writeFileSync(RUNTIME_COOKIES_PATH, content + "\n");
    console.log(`[Stream] Wrote cookies from env var (${content.length} bytes)`);
    return ["--cookies", RUNTIME_COOKIES_PATH];
  }

  return [];
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
      "--js-runtimes", "node",
      ...getCookiesArgs(),
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
