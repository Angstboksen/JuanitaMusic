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

	async execute({ interaction, player, lang }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		console.log(queue)
		if (!queue || !queue.playing)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		if (!queue.previousTracks[1])
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_PREVIOUS_TRACK_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		await queue.back();

		return interaction.reply({
			embeds: [
				SimpleEmbed(`${BACK_PLAYING_TRACK_SUCCESS[lang]}\` ${queue.previousTracks[1].title}\``, EmbedType.Success),
			],
		});
	},
} as JuanitaCommand;
