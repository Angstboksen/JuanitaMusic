import type JuanitaClient from '../JuanitaClient';

module.exports = async (client: JuanitaClient) => {
	console.log(
		`Logged to the client ${client.user?.username}\n-> Ready on ${client.guilds.cache.size} servers for a total of ${client.users.cache.size} users`,
	);
	client.user?.setActivity(client.config.app.playing);
};
