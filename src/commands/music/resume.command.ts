import { JuanitaCommand } from '../types';

export default {
	name: 'resume',
	description: 'play the track',
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

		if (!queue.connection.paused)
			return interaction.reply({
				content: `The track is already running, ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		const success = queue.setPaused(false);

		return interaction.reply({
			content: success
				? `Current music ${queue.current.title} resumed ✅`
				: `Something went wrong ${interaction.member}... try again ? ❌`,
		});
	},
} as JuanitaCommand;
