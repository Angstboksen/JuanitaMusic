import { ApplicationCommandOptionType } from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'jump',
	description: 'Jumps to particular track in queue',
	voiceChannel: true,
	options: [
		{
			name: 'song',
			description: 'the name/url of the track you want to jump to',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'number',
			description: 'the place in the queue the song is in',
			type: ApplicationCommandOptionType.Number,
			required: false,
		},
	],

	async execute({ interaction, player }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const track = (interaction.options as any).getString('song');
		const number = (interaction.options as any).getNumber('number');

		const queue = player.getQueue(interaction.guildId);

		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		if (!track && !number)
			interaction.reply({
				content: `You have to use one of the options to jump to a song ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		if (track) {
			for (let song of queue.tracks) {
				if (song.title === track || song.url === track) {
					queue.skipTo(song);
					return interaction.reply({ content: `skiped to ${track} ✅` });
				}
			}

			return interaction.reply({
				content: `could not find ${track} ${interaction.member}... try using the url or the full name of the song ? ❌`,
				ephemeral: true,
			});
		}
		if (number) {
			if (number > queue.tracks.length)
				return interaction.reply({
					content: `There are only ${queue.tracks.length} songs in the queue ${interaction.member}... try again ?❌`,
					ephemeral: true,
				});
			const index = number - 1;
			const trackname = queue.tracks[index]!.title;
			if (!trackname)
				return interaction.reply({
					content: `This track dose not seem to exist ${interaction.member}...  try again ?❌`,
					ephemeral: true,
				});
			queue.skipTo(index);
			return interaction.reply({ content: `Jumped to ${trackname}  ✅` });
		}
		return;
	},
} as JuanitaCommand;
