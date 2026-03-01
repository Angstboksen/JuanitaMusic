import type { GuildMember, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import type { Language } from "../i18n/types.js";
import { getOrCreateGuildState, guildStates } from "../music/guildState.js";
import { startQueueInterval, sendOrUpdateQueueEmbed, cleanupQueueEmbed } from "../embeds/queueEmbed.js";
import { getAlias, saveAlias as saveAliasDb, listAliases as listAliasesDb, deleteAlias as deleteAliasDb } from "../db/repositories/aliasRepo.js";
import { setGuildLanguage, toggleAutoDj } from "../db/repositories/guildRepo.js";

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

const VOICE_REQUIRED_TOOLS = new Set([
  "play_song", "skip", "pause", "shuffle", "clear_queue", "disconnect",
  "jump_to", "seek", "back", "play_first", "remove",
]);

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: "function",
    function: {
      name: "play_song",
      description: "Search for and queue a song or playlist. Supports song names, artist names, URLs, or saved aliases.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song name, artist name, URL, or saved alias to search for" },
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
  {
    type: "function",
    function: {
      name: "back",
      description: "Play the previous track that was playing before the current one.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "play_first",
      description: "Search for a song or playlist and add it to the FRONT of the queue so it plays next. Supports aliases.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song name, URL, or saved alias to add at the front of the queue" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove",
      description: "Remove a song from the queue by its position (1-based).",
      parameters: {
        type: "object",
        properties: {
          position: { type: "number", description: "Queue position of the song to remove (1 = first song in queue)" },
        },
        required: ["position"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_alias",
      description: "Save a URL (playlist or song) with a short name so it can be played later using just the alias name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Short alias name to save (e.g. 'chill', 'workout')" },
          url: { type: "string", description: "The URL (YouTube/Spotify playlist or song) to save" },
        },
        required: ["name", "url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_aliases",
      description: "List all saved aliases for this server.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_alias",
      description: "Delete a saved alias by name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The alias name to delete" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_language",
      description: "Change the bot's language for this server. Available languages: 'en' (English), 'no' (Norwegian), 'molde' (Molde dialect).",
      parameters: {
        type: "object",
        properties: {
          language: { type: "string", description: "Language code: 'en', 'no', or 'molde'" },
        },
        required: ["language"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggle_autodj",
      description: "Toggle auto-DJ on or off. When enabled, the bot will automatically play random songs from this server's history when the queue runs out.",
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

  if (VOICE_REQUIRED_TOOLS.has(name) && !member.voice.channel) {
    return "Error: User is not in a voice channel. They need to join a voice channel first.";
  }

  switch (name) {
    case "play_song": {
      const query = args.query as string;
      if (!query) return "Error: No search query provided.";

      const alias = await getAlias(guildId, query);
      const searchQuery = alias ? alias.playlistId : query;

      const result = await client.kazagumo.search(searchQuery, { requester: member });
      if (!result.tracks.length) return `No results found for: ${query}`;

      let player = client.getPlayer(guildId);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId,
          textId: textChannel.id,
          voiceId: member.voice.channel!.id,
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

    case "back": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const previousTracks = player.queue.previous;
      const previous = Array.isArray(previousTracks) ? previousTracks[0] : previousTracks;
      if (!previous) return "Error: No previous track to go back to.";
      player.play(previous);
      return `Playing previous track: ${previous.title}`;
    }

    case "play_first": {
      const query = args.query as string;
      if (!query) return "Error: No search query provided.";

      const alias = await getAlias(guildId, query);
      const searchQuery = alias ? alias.playlistId : query;

      const result = await client.kazagumo.search(searchQuery, { requester: member });
      if (!result.tracks.length) return `No results found for: ${query}`;

      let player = client.getPlayer(guildId);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId,
          textId: textChannel.id,
          voiceId: member.voice.channel!.id,
          volume: 50,
        });
      }

      const isPlaylist = result.type === "PLAYLIST";
      const tracksToAdd = isPlaylist ? result.tracks : [result.tracks[0]!];

      const currentQueue = [...player.queue];
      player.queue.clear();
      player.queue.add(tracksToAdd);
      if (currentQueue.length > 0) {
        player.queue.add(currentQueue);
      }

      if (!player.playing && !player.paused) {
        player.play();
      }

      const state = await getOrCreateGuildState(guildId, member.guild.name);
      startQueueInterval(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());
      sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, textChannel, client.user?.displayAvatarURL());

      const title = isPlaylist ? result.playlistName : result.tracks[0]!.title;
      return isPlaylist
        ? `Added playlist to front: ${title} (${result.tracks.length} songs)`
        : `Added to front of queue: ${title}`;
    }

    case "remove": {
      const player = client.getPlayer(guildId);
      if (!player?.queue.current) return "Error: No music is currently playing.";
      const pos = Math.floor(args.position as number);
      const queueTracks = [...player.queue];
      if (pos < 1 || pos > queueTracks.length) {
        return `Error: Invalid position. Queue has ${queueTracks.length} songs (1-${queueTracks.length}).`;
      }
      const removed = queueTracks[pos - 1]!;
      player.queue.splice(pos - 1, 1);
      return `Removed from queue: ${removed.title}`;
    }

    case "save_alias": {
      const aliasName = args.name as string;
      const url = args.url as string;
      if (!aliasName || !url) return "Error: Both alias name and URL are required.";
      await saveAliasDb(guildId, aliasName, url);
      return `Saved alias '${aliasName}' → ${url}`;
    }

    case "list_aliases": {
      const aliasList = await listAliasesDb(guildId);
      if (aliasList.length === 0) return "No saved aliases for this server.";
      const formatted = aliasList
        .map((a, i) => `${i + 1}. ${a.alias} → ${a.playlistId}`)
        .join("\n");
      return `Saved aliases:\n${formatted}`;
    }

    case "delete_alias": {
      const aliasName = args.name as string;
      if (!aliasName) return "Error: Alias name is required.";
      const deleted = await deleteAliasDb(guildId, aliasName);
      return deleted ? `Deleted alias '${aliasName}'.` : `Error: Alias '${aliasName}' not found.`;
    }

    case "set_language": {
      const language = args.language as string;
      const valid: Language[] = ["en", "no", "molde"];
      if (!valid.includes(language as Language)) {
        return `Error: Invalid language '${language}'. Valid options: en, no, molde.`;
      }
      await setGuildLanguage(guildId, language as Language);
      const state = guildStates.get(guildId);
      if (state) state.lang = language as Language;
      return `Language set to '${language}'.`;
    }

    case "toggle_autodj": {
      const newValue = await toggleAutoDj(guildId);
      const state = guildStates.get(guildId);
      if (state) state.autoDj = newValue;
      return newValue ? "Auto-DJ enabled. The bot will keep playing from history when the queue runs out." : "Auto-DJ disabled.";
    }

    default:
      return `Error: Unknown tool: ${name}`;
  }
}
