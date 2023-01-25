import { ApplicationCommandOptionType } from 'discord.js';
import type { JuanitaCommand } from '../types';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	SEEK_INVALID_TIME_ERROR,
	SEEK_SUCCESS,
} from '../../embeds/messages';
import { millisecondsToTime } from '../../utils/time';

export default {
	name: 'seek',
	description: 'Skip to a time in the current song',
	voiceChannel: true,
	options: [
		{
			name: 'time',
			description: 'Amount of seconds to skip to',
			type: ApplicationCommandOptionType.Number,
			required: true,
		},
	],
	async execute({ interaction, player, juanitaGuild }) {
		if (!interaction.guildId || !interaction.member || !player)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.current)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const timeToMS = (interaction.options as any).getNumber('time') * 1000;

		if (timeToMS >= queue.current.durationMS)
			return interaction.reply({
				embeds: [SimpleEmbed(SEEK_INVALID_TIME_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const success = await queue.seek(timeToMS);
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		juanitaGuild.updateQueueMessage();
		return interaction.reply({
			embeds: [
				SimpleEmbed(`${SEEK_SUCCESS[juanitaGuild.lang]} \`${millisecondsToTime(timeToMS)}\``, EmbedType.Success),
			],
			ephemeral: true,
		});
	},
} as JuanitaCommand;
