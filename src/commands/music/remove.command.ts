import { ApplicationCommandOptionType } from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'remove',
	description: 'remove a song from the queue',
	voiceChannel: true,
	options: [
		{
			name: 'song',
			description: 'the name/url of the track you want to remove',
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

		const number = (interaction.options as any).getNumber('number');
		const track = (interaction.options as any).getString('song');
		const queue = player.getQueue(interaction.guildId);

		if (!queue || !queue.playing)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});
		if (!track && !number)
			interaction.reply({
				content: `You have to use one of the options to remove a song ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		if (track) {
			for (let song of queue.tracks) {
				if (song.title === track || song.url === track) {
					queue.remove(song);
					return interaction.reply({ content: `removed ${track} from the queue ✅` });
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
					content: `There is no song in the queue with that number ${interaction.member}... try again ?❌`,
					ephemeral: true,
				});
			const index = number - 1;
			const trackname = queue.tracks[index]!.title;

			if (!trackname)
				return interaction.reply({
					content: `This track dose not seem to exist ${interaction.member}...  try again ?❌`,
					ephemeral: true,
				});

			queue.remove(index);

			return interaction.reply({ content: `removed ${trackname} from the queue ✅` });
		}
		return;
	},
} as JuanitaCommand;
