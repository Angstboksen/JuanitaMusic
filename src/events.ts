import type { ModelsSearch } from './.generated/api/api';
import type JuanitaClient from './JuanitaClient';
import { storeSearch } from './service/searchService';
import { timeToMilliseconds } from './utils/time';

const loadPlayer = (client: JuanitaClient) => {
	const player = client.player;

	player.on('error', (_, error) => {
		console.log(`Error emitted from the queue ${error.message}`);
	});

	player.on('connectionError', (_, error) => {
		console.log(`Error emitted from the connection ${error.message}`);
	});

	player.on('trackStart', async (queue, _) => {
		if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
		const guild = client.getJuanitaGuild(queue.connection.channel.guild.id);
		guild.updateQueueMessage();
	});

	player.on('trackEnd', async (queue, track) => {
		const guild = client.getJuanitaGuild(queue.connection.channel.guild.id);
		const { title, duration, requestedBy, url } = track;
		const searchModel: ModelsSearch = {
			title,
			date: new Date().toString(),
			duration: timeToMilliseconds(duration) / 1000,
			requestor: {
				tag: requestedBy.tag,
				id: requestedBy.id,
			},
			url,
			guild: guild.id,
		};
		try {
			await storeSearch(searchModel);
		} catch {
			console.log(`Error storing search: ${searchModel}}`);
		}
	});
};

export default loadPlayer;
