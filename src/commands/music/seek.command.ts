import { ApplicationCommandOptionType } from 'discord.js';
import type { JuanitaCommand } from '../types';
import ms from 'ms';

export default {
	name: 'seek',
	description: 'skip back or foward in a song',
	voiceChannel: true,
	options: [
		{
			name: 'time',
			description: 'time that you want to skip to',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	async execute({ interaction, player }) {
		if (!interaction.guildId || !interaction.member || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });
		const queue = player.getQueue(interaction.guildId);

		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.reply}... try again ? ❌`,
				ephemeral: true,
			});

		const timeToMS = +ms((interaction.options as any).getString('time'));

		if (timeToMS >= queue.current.durationMS)
			return interaction.reply({
				content: `The indicated time is higher than the total time of the current song ${interaction.member}... try again ? ❌\n*Try for example a valid time like **5s, 10s, 20 seconds, 1m**...*`,
				ephemeral: true,
			});

		await queue.seek(timeToMS);

		return interaction.reply({ content: `Time set on the current song **${ms(timeToMS, { long: true })}** ✅` });
	},
} as JuanitaCommand;
