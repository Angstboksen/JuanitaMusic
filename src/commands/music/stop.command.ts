import type { JuanitaCommand } from "../types";

export default {
	name: "stop",
	description: "stop the track",
	voiceChannel: true,

	execute({ interaction, player }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ content: "Something went wrong ❌", ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		queue.destroy();

		return interaction.reply({ content: `Music stopped intero this server, see you next time ✅` });
	},
} as JuanitaCommand;
