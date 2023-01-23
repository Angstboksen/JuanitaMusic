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

	// player.on("trackAdd", (queue, track) => {
	// 	const metadata = queue.metadata as any;
	// 	metadata.send(`Track ${track.title} added in the queue ✅`);
	// });

	player.on("botDisconnect", (queue) => {
		const metadata = queue.metadata as any;
		metadata.send("I was manually disconnected from the voice channel, clearing queue... ❌");
	});

	player.on("channelEmpty", (queue) => {
		const metadata = queue.metadata as any;
		metadata.send("Nobody is in the voice channel, leaving the voice channel... ❌");
	});

	player.on("queueEnd", (queue) => {
		const guild = client.getJuanitaGuild(queue.connection.channel.guild.id);
		guild.removeQueueMessage();
		const metadata = queue.metadata as any;
		metadata.send("I finished reading the whole queue ✅");
	});
};

export default loadPlayer;
