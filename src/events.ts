import type JuanitaClient from "./JuanitaClient";

const loadPlayer = (client: JuanitaClient) => {
	const player = client.player;

	player.on("error", (_, error) => {
		console.log(`Error emitted from the queue ${error.message}`);
	});

	player.on("connectionError", (_, error) => {
		console.log(`Error emitted from the connection ${error.message}`);
	});

	player.on("trackStart", (queue, _) => {
		if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
		const guild = client.getJuanitaGuild(queue.connection.channel.guild.id);
		guild.updateQueueMessage()
	});

	player.on("queueEnd", (queue) => {
		const guild = client.getJuanitaGuild(queue.connection.channel.guild.id);
		guild.removeQueueMessage();
	});
};

export default loadPlayer;
