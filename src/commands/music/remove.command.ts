import { ApplicationCommandOptionType } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	JUMP_QUEUE_POSITION_ERROR,
	REMOVE_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'remove',
	description: 'Remove a song from the queue!',
	voiceChannel: true,
	options: [
		{
			name: 'number',
			description: 'The position of the song in the queue',
			type: ApplicationCommandOptionType.Number,
			required: true,
		},
	],

	async execute({ interaction, player, juanitaGuild }) {
		if (!interaction.guildId || !player)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const number = (interaction.options as any).getNumber('number');
		const queue = player.getQueue(interaction.guildId);

		if (!queue || !queue.current)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		if (!number || number > queue.tracks.length)
			interaction.reply({
				embeds: [
					SimpleEmbed(
						`${JUMP_QUEUE_POSITION_ERROR[juanitaGuild.lang]} \`(${`1 - ${queue.tracks.length}`})\``,
						EmbedType.Error,
					),
				],
				ephemeral: true,
			});

		const index = number - 1;
		const trackName = queue.tracks[index]!.title;
		queue.remove(index);

		return interaction.reply({
			embeds: [SimpleEmbed(`${REMOVE_SUCCESS[juanitaGuild.lang]} \`${trackName}\``, EmbedType.Success)],
		});
	},
} as JuanitaCommand;
