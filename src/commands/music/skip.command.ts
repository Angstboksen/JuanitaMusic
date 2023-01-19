import { JuanitaCommand } from '../types';

export default {
	name: 'skip',
	description: 'stop the track',
	voiceChannel: true,

	execute({ interaction, player }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		const success = queue.skip();

		return interaction.reply({
			content: success
				? `Current music ${queue.current.title} skipped ✅`
				: `Something went wrong ${interaction.member}... try again ? ❌`,
		});
	},
} as JuanitaCommand;
