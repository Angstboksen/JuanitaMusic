import type JuanitaClient from './JuanitaClient';
import { readdirSync } from 'fs';
import { Collection } from 'discord.js';
import loadPlayer from './events';
import type { JuanitaCommand } from './commands/types';

const loadClient = (Jclient: JuanitaClient) => {
	loadPlayer(Jclient);
	Jclient.commands = new Collection();
	const commandArray: any[] = [];

	const events = readdirSync('./src/events/').filter((file) => file.endsWith('.js'));
	
	console.log(`Loading events...`);

	for (const file of events) {
		const event = require(`./events/${file}`);
		const fileName: string | undefined = file.split('.')[0];
		if (fileName) {
			console.log(`-> [Loaded Event] ${fileName}`);
			Jclient.on(fileName, event.bind(null, Jclient));
		}
		delete require.cache[require.resolve(`./events/${file}`)];
	}

	console.log(`Loading commands...`);

	readdirSync('./src/commands/').forEach((dirs) => {
		if (dirs.includes('.')) return
		const commands: string[] = readdirSync(`./src/commands/${dirs}`).filter((files) => files.endsWith('.js'));

		for (const file of commands) {
			const command: JuanitaCommand = require(`./commands/${dirs}/${file}`);
			if (command.name && command.description) {
				commandArray.push(command);
				console.log(`-> [Loaded Command] ${command.name.toLowerCase()}`);
				Jclient.commands.set(command.name.toLowerCase(), command);
				delete require.cache[require.resolve(`./commands/${dirs}/${file}`)];
			} else console.log(`[failed Command]  ${command.name.toLowerCase()}`);
		}
	});

	Jclient.on('ready', (client) => {
		console.log(`Logged in as ${client.user?.tag}!`);
		if (Jclient.config.app.global) client.application.commands.set(commandArray);
		else client.guilds.cache.get(Jclient.config.app.guild!)?.commands.set(commandArray);
	});
};

export default loadClient;
