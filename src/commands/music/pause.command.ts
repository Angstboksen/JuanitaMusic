import { JuanitaCommand } from '../types';

export default {
	name: 'pause',
	description: 'pause the track',
	voiceChannel: true,

	execute({ interaction, player }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		if (queue.connection.paused)
			return interaction.reply({ content: 'The track is currently paused!', ephemeral: true });

		if (queue.connection.paused)
			return interaction.reply({
				content: `The track is currently paused, ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		const success = queue.setPaused(true);

		return interaction.reply({
			content: success
				? `Current music ${queue.current.title} paused ✅`
				: `Something went wrong ${interaction.member}... try again ? ❌`,
		});
	},
} as JuanitaCommand;
