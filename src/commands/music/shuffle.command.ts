import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_EMPTY_QUEUE,
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	SHUFFLE_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'shuffle',
	description: 'Shuffle the current queue!',
	voiceChannel: true,

	async execute({ interaction, player, juanitaGuild }) {
		if (!interaction.guildId || !player)
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

		if (!queue.tracks[0])
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_EMPTY_QUEUE[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		juanitaGuild.updateQueueMessage();
		const success = queue.shuffle();
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		return interaction.reply({ embeds: [SimpleEmbed(SHUFFLE_SUCCESS[juanitaGuild.lang], EmbedType.Success)] });
	},
} as JuanitaCommand;
