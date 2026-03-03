import { config } from "./config.js";
import { JuanitaClient } from "./client.js";
import { registerCommands } from "./core/commandRegistry.js";
import { setupInteractionHandler } from "./core/interactionRouter.js";
import { setupMentionHandler } from "./core/mentionHandler.js";
import { logPlay } from "./db/repositories/historyRepo.js";
import { guildStates, getOrCreateGuildState } from "./music/guildState.js";
import { cleanupQueueEmbed } from "./embeds/queueEmbed.js";
import { searchTracks } from "./music/search.js";
import { VoiceCommandHandler } from "./voice/voiceCommandHandler.js";

const client = new JuanitaClient();

// Player events
client.playerManager.on("trackStart", async (player, track) => {
  console.log(`[Player] ${player.guildId}: Playing ${track.title}`);

  // Start voice listening if enabled for this guild
  if (client.voiceHandler) {
    const state = await getOrCreateGuildState(player.guildId, "");
    if (state.voiceEnabled) {
      const guild = client.guilds.cache.get(player.guildId);
      if (guild && player.voiceChannelId && player.textChannelId) {
        await client.voiceHandler.startListening(
          client,
          guild,
          player.voiceChannelId,
          player.textChannelId,
        );
      }
    }
  }
});

client.playerManager.on("trackEnd", async (player, track) => {
  if (track) {
    try {
      await logPlay({
        guildId: player.guildId,
        title: track.title ?? "Unknown",
        url: track.url ?? "",
        durationSeconds: track.duration ? Math.floor(track.duration / 1000) : undefined,
        requestedById: track.requester?.id ?? "unknown",
        requestedByTag: track.requester?.tag ?? track.requester?.user?.tag ?? "Unknown",
      });
    } catch (e) {
      console.error("[DB] Failed to log play:", e);
    }
  }
});

client.playerManager.on("queueEmpty", async (player) => {
  console.log(`[Player] ${player.guildId}: Queue empty`);
  const state = guildStates.get(player.guildId);

  // Auto-DJ: queue a random song from history instead of disconnecting
  if (state?.autoDj) {
    try {
      const { getRandomSong } = await import("./db/repositories/historyRepo.js");
      const url = await getRandomSong(player.guildId);
      if (url) {
        const result = await searchTracks(url, client.user);
        if (result.tracks.length > 0) {
          player.queue.add(result.tracks[0]!);
          player.play();
          console.log(`[Auto-DJ] ${player.guildId}: Queued ${result.tracks[0]!.title}`);

          const { sendOrUpdateQueueEmbed } = await import("./embeds/queueEmbed.js");
          sendOrUpdateQueueEmbed(state.queueEmbed, player, state.lang, undefined, client.user?.displayAvatarURL());
          return;
        }
      }
    } catch (e) {
      console.error("[Auto-DJ] Failed to queue random song:", e);
    }
  }

  // Default: cleanup and disconnect
  client.voiceHandler?.stopListening(player.guildId);
  if (state) await cleanupQueueEmbed(state.queueEmbed);
  player.destroy();
});

// Discord ready — register commands
client.on("clientReady", async (c) => {
  console.log(`[Bot] Logged in as ${c.user.tag}`);

  const commands = await registerCommands(client);
  console.log(`[Bot] Loaded ${commands.length} commands`);

  // Register slash commands
  if (config.bot.devGuildId) {
    const guild = c.guilds.cache.get(config.bot.devGuildId);
    await guild?.commands.set(commands);
    console.log(`[Bot] Registered commands to dev guild: ${config.bot.devGuildId}`);
  } else {
    await c.application.commands.set(commands);
    console.log("[Bot] Registered commands globally");
  }
});

// Set up interaction handling
setupInteractionHandler(client);
setupMentionHandler(client);

// Initialize voice assistant
const voiceHandler = new VoiceCommandHandler();
const voiceReady = await voiceHandler.initialize();
if (voiceReady) {
  client.voiceHandler = voiceHandler;
}

// Login
client.login(config.bot.token);
