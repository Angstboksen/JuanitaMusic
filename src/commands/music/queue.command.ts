import type { TextChannel } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	GENERIC_NO_TEXT_CHANNEL,
	QUEUE_SILENT_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'queue',
	description: 'Get a list of all the songs in the queue!',
	voiceChannel: true,

	async execute({ interaction, player, client, juanitaGuild }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		juanitaGuild.queue = queue;
		
		const channel = interaction.channel;
		if (!channel) {
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_TEXT_CHANNEL[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		}

		await interaction.reply({
			embeds: [SimpleEmbed(QUEUE_SILENT_SUCCESS[juanitaGuild.lang], EmbedType.Success)],
			ephemeral: true,
		});
		return juanitaGuild.startInterval(interaction.channel as TextChannel);
	},
} as JuanitaCommand;
