import type { GuildMember, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import type { Language } from "../i18n/types.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { startQueueInterval, sendOrUpdateQueueEmbed, cleanupQueueEmbed } from "../embeds/queueEmbed.js";

export interface ToolContext {
  client: JuanitaClient;
  guildId: string;
  member: GuildMember;
  textChannel: TextChannel;
  lang: Language;
}

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required?: string[];
    };
  };
}

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: "function",
    function: {
      name: "play_song",
      description: "Search for and queue a song or playlist. Use this when the user wants to listen to something.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song name, artist name, or URL to search for" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "skip",
      description: "Skip the currently playing song and move to the next one in the queue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "pause",
      description: "Toggle pause/resume on the current song.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_queue",
      description: "Remove all songs from the queue (keeps current song playing).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "disconnect",
      description: "Disconnect the bot from the voice channel and stop all music.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "jump_to",
      description: "Jump to a specific position in the queue (1-based).",
      parameters: {
        type: "object",
        properties: {
          position: { type: "number", description: "Queue position to jump to (1 = first song in queue)" },
        },
        required: ["position"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "seek",
      description: "Seek to a specific time in the currently playing song.",
      parameters: {
        type: "object",
        properties: {
          seconds: { type: "number", description: "Time in seconds to seek to" },
        },
        required: ["seconds"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend",
      description: "Get song recommendations based on this server's listening history. Use when users ask for recommendations or suggestions.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  const { client, guildId, member, textChannel, lang } = ctx;

  if (!member.voice.channel) {
    return "Error: User is not in a voice channel. They need to join a voice channel first.";
  }

  switch (name) {
    case "play_song": {
      const query = args.query as string;
      if (!query) return "Error: No search query provided.";

      const result = await client.kazagumo.search(query, { requester: member });
      if (!result.tracks.length) return `No results found for: ${query}`;

      let player = client.getPlayer(guildId);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId,
          textId: textChannel.id,
          voiceId: member.voice.channel.id,
          volume: 50,
        });
      }

      const isPlaylist = result.type === "PLAYLIST";
      if (isPlaylist) {
        player.queue.add(result.tracks);
      } else {
        player.queue.add(result.tracks[0]!);
      }

      if (!player.playing && !player.paused) {
        player.play();
      }

      const state = await getOrCreateGuildState(guildId, member.guild.name);
      startQueueInterval(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());
      sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());

      const title = isPlaylist ? result.playlistName : result.tracks[0]!.title;
      return isPlaylist
        ? `Added playlist: ${title} (${result.tracks.length} songs)`
        : `Added to queue: ${title}`;
    }

    case "skip": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const title = player.queue.current.title;
      player.skip();
      return `Skipped: ${title}`;
    }

    case "pause": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const wasPaused = player.paused;
      player.pause(!wasPaused);
      return wasPaused ? "Resumed playback." : "Paused playback.";
    }

    case "shuffle": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      if ([...player.queue].length < 2) return "Error: Need at least 2 songs in queue to shuffle.";
      player.queue.shuffle();
      return "Shuffled the queue.";
    }

    case "clear_queue": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      player.queue.clear();
      return "Cleared the queue.";
    }

    case "disconnect": {
      const player = client.getPlayer(guildId);
      if (!player) return "Error: Bot is not connected to a voice channel.";
      const state = await getOrCreateGuildState(guildId, member.guild.name);
      await cleanupQueueEmbed(state.queueEmbed);
      player.destroy();
      return "Disconnected from voice channel.";
    }

    case "jump_to": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const position = Math.floor(args.position as number);
      const tracks = [...player.queue];
      if (position < 1 || position > tracks.length) {
        return `Error: Invalid position. Queue has ${tracks.length} songs (1-${tracks.length}).`;
      }
      const target = tracks[position - 1]!;
      if (position > 1) player.queue.splice(0, position - 1);
      player.skip();
      return `Jumped to: ${target.title}`;
    }

    case "seek": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const seconds = Math.floor(args.seconds as number);
      const durationMs = player.queue.current.length ?? 0;
      if (seconds < 0 || seconds * 1000 > durationMs) {
        return `Error: Invalid seek time. Song duration is ${Math.floor(durationMs / 1000)} seconds.`;
      }
      player.shoukaku.seekTo(seconds * 1000);
      return `Seeked to ${seconds} seconds.`;
    }

    case "recommend": {
      const { getTopSongs } = await import("../db/repositories/historyRepo.js");
      const topSongs = await getTopSongs(guildId, 20);
      if (topSongs.length < 3) return "Not enough listening history to make recommendations. The server needs to play more songs first.";
      const songList = topSongs
        .map((s, i) => `${i + 1}. ${s.title} (${s.playCount} plays)`)
        .join("\n");
      return `Here are this server's most played songs:\n${songList}\n\nUse this data to recommend new songs. If they want you to play one, use the play_song tool.`;
    }

    default:
      return `Error: Unknown tool: ${name}`;
  }
}
