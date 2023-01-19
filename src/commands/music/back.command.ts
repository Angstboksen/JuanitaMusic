import { JuanitaCommand } from '../types';

export default {
	name: 'back',
	description: 'Go back the song before',
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

		if (!queue.previousTracks[1])
			return interaction.reply({
				content: `There was no music played before ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		await queue.back();

		interaction.reply({ content: `Playing the **previous** track ✅` });
	},
} as JuanitaCommand;

