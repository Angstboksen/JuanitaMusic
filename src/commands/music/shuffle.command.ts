import type { JuanitaCommand } from '../types';

export default {
	name: 'shuffle',
	description: 'shuffle the track',
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

		queue.shuffle();

		return interaction.reply({ content: `Queue shuffled **${queue.tracks.length}** song(s) ! ✅` });
	},
} as JuanitaCommand;
