import { config } from "./config.js";
import { JuanitaClient } from "./client.js";

const client = new JuanitaClient();

// Lavalink events
client.kazagumo.shoukaku.on("ready", (name) =>
  console.log(`[Lavalink] Node ${name}: Ready`),
);
client.kazagumo.shoukaku.on("error", (name, error) =>
  console.error(`[Lavalink] Node ${name}: Error`, error),
);
client.kazagumo.shoukaku.on("disconnect", (name) =>
  console.log(`[Lavalink] Node ${name}: Disconnected`),
);

// Discord ready
client.on("ready", (c) => {
  console.log(`[Bot] Logged in as ${c.user.tag}`);
});

client.login(config.bot.token);
