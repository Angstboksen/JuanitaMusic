import "reflect-metadata";
import path from "path";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import {config} from 'dotenv'
config()

const client = new Client({
  simpleCommand: {
    prefix: process.env.PREFIX,
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  classes: [
    path.join(__dirname, "commands", "**/*.{ts,js}"),
  ],
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  silent: true,
});

client.once("ready", async () => {
  await client.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });
  await client.initApplicationPermissions();

  console.log("Juanita is now online");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

client.login(process.env.BOT_TOKEN ?? ""); // provide your bot token