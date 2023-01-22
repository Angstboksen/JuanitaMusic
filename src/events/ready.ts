import { ActivityType } from "discord.js";
import type JuanitaClient from "../JuanitaClient";

export default async (client: JuanitaClient) => {
	console.log(
		`Logged to the client ${client.user?.username}\n-> Ready on ${client.guilds.cache.size} servers for a total of ${client.users.cache.size} users`,
	);
	client.user?.setActivity(client.config.app.playing, { type: ActivityType.Listening });
};
