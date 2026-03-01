import { config } from "./config.js";
import { JuanitaClient } from "./client.js";
import { registerCommands } from "./core/commandRegistry.js";
import { setupInteractionHandler } from "./core/interactionRouter.js";
import { setupMentionHandler } from "./core/mentionHandler.js";
import { logPlay } from "./db/repositories/historyRepo.js";
import { guildStates } from "./music/guildState.js";
import { cleanupQueueEmbed } from "./embeds/queueEmbed.js";

const client = new JuanitaClient();

// Lavalink node events
client.kazagumo.shoukaku.on("ready", (name) =>
  console.log(`[Lavalink] Node ${name}: Ready`),
);
client.kazagumo.shoukaku.on("error", (name, error) =>
  console.error(`[Lavalink] Node ${name}: Error`, error),
);
client.kazagumo.shoukaku.on("disconnect", (name) =>
  console.log(`[Lavalink] Node ${name}: Disconnected`),
);

// Kazagumo player events
client.kazagumo.on("playerStart", (player, track) => {
  console.log(`[Player] ${player.guildId}: Playing ${track.title}`);
});

client.kazagumo.on("playerEnd", async (player) => {
  const previousTracks = player.queue.previous;
  const track = Array.isArray(previousTracks) ? previousTracks[0] : previousTracks;
  if (track) {
    try {
      await logPlay({
        guildId: player.guildId,
        title: track.title ?? "Unknown",
        url: track.uri ?? "",
        durationSeconds: track.length ? Math.floor(track.length / 1000) : undefined,
        requestedById: (track.requester as any)?.id ?? "unknown",
        requestedByTag: (track.requester as any)?.tag ?? (track.requester as any)?.user?.tag ?? "Unknown",
      });
    } catch (e) {
      console.error("[DB] Failed to log play:", e);
    }
  }
});

client.kazagumo.on("playerEmpty", async (player) => {
  console.log(`[Player] ${player.guildId}: Queue empty`);
  const state = guildStates.get(player.guildId);

  // Auto-DJ: queue a random song from history instead of disconnecting
  if (state?.autoDj) {
    try {
      const { getRandomSong } = await import("./db/repositories/historyRepo.js");
      const url = await getRandomSong(player.guildId);
      if (url) {
        const result = await client.kazagumo.search(url, { requester: client.user });
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
  if (state) await cleanupQueueEmbed(state.queueEmbed);
  player.destroy();
});

// Discord ready — register commands
client.on("ready", async (c) => {
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

// Login
client.login(config.bot.token);
