import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	GENERIC_NO_PREVIOUS_TRACK_ERROR,
	BACK_PLAYING_TRACK_SUCCESS,
	GENERIC_ERROR,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'back',
	description: 'Plays the previous track!',
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

		if (!queue.previousTracks[1])
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_PREVIOUS_TRACK_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		await queue.back();
		juanitaGuild.updateQueueMessage();
		return interaction.reply({
			embeds: [
				SimpleEmbed(
					`${BACK_PLAYING_TRACK_SUCCESS[juanitaGuild.lang]}\` ${queue.previousTracks[1].title}\``,
					EmbedType.Success,
				),
			],
		});
	},
} as JuanitaCommand;
