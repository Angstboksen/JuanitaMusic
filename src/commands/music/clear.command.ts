import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { CLEAR_QUEUE_SUCCESS, GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR } from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'clear',
	description: 'Clears the queue!',
	voiceChannel: true,

	async execute({ interaction, player, lang }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		queue.clear();
		return interaction.reply({ embeds: [SimpleEmbed(CLEAR_QUEUE_SUCCESS[lang], EmbedType.Success)] });
	},
} as JuanitaCommand;
