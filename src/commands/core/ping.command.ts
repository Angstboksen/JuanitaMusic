import ms from "ms";
import type{ JuanitaCommand } from "../types";

export default {
	name: "ping",
	description: "Get the ping of the bot!",
	async execute({ interaction, client }) {
		if (!client) return interaction.reply({ content: "Something went wrong ❌", ephemeral: true });
		await interaction.reply("Ping?");
		return interaction.editReply(
			`Pong! API Latency is ${Math.round(client.ws.ping)}ms 🛰️, Last heartbeat calculated ${ms(
				Date.now() - client.ws.shards.first()!.lastPingTimestamp,
				{ long: true },
			)} ago`,
		);
	},
} as JuanitaCommand;
