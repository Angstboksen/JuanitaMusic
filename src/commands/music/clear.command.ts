import type { JuanitaCommand } from '../types';

export default {
	name: 'clear',
	description: 'clear all the music in the queue',
	voiceChannel: true,

	async execute({ interaction, player }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		if (!queue.tracks[0])
			return interaction.reply({
				content: `No music in the queue after the current one ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		queue.clear();
		return interaction.reply(`The queue has just been cleared 🗑️`);
	},
} as JuanitaCommand;
