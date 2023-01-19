import { EmbedBuilder } from 'discord.js';
import type JuanitaClient from './JuanitaClient';

const loadPlayer = (client: JuanitaClient) => {
	const player = client.player;

	player.on('error', (_, error) => {
		console.log(`Error emitted from the queue ${error.message}`);
	});

	player.on('connectionError', (_, error) => {
		console.log(`Error emitted from the connection ${error.message}`);
	});

	player.on('trackStart', (queue, track) => {
		if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Started playing ${track.title} in ${queue.connection.channel.name} 🎧`,
				iconURL: track.requestedBy.avatarURL()!,
			})
			.setColor('#13f857');

		const metadata = queue.metadata as any;
		metadata.send({ embeds: [embed] });
	});

	player.on('trackAdd', (queue, track) => {
		const metadata = queue.metadata as any;
		metadata.send(`Track ${track.title} added in the queue ✅`);
	});

	player.on('botDisconnect', (queue) => {
		const metadata = queue.metadata as any;
		metadata.send('I was manually disconnected from the voice channel, clearing queue... ❌');
	});

	player.on('channelEmpty', (queue) => {
		const metadata = queue.metadata as any;
		metadata.send('Nobody is in the voice channel, leaving the voice channel... ❌');
	});

	player.on('queueEnd', (queue) => {
		const metadata = queue.metadata as any;
		metadata.send('I finished reading the whole queue ✅');
	});

	player.on('tracksAdd', (queue, _) => {
		const metadata = queue.metadata as any;
		metadata.send(`All the songs in playlist added into the queue ✅`);
	});
};

export default loadPlayer;
