import { GatewayIntentBits } from 'discord.js';
import envConfig from './config';
import JuanitaClient from './src/JuanitaClient';

const client = new JuanitaClient(
	{
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.MessageContent,
		],
	},
	envConfig,
);

client.login(process.env.BOT_TOKEN);
