import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR, PAUSE_SUCCESS } from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'pause',
	description: 'Pause the current track!',
	voiceChannel: true,

	execute({ interaction, player, lang }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		const success = queue.setPaused(true);
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		return interaction.reply({
			embeds: [SimpleEmbed(`⏸ \`${queue.current.title}\` ${PAUSE_SUCCESS[lang]}`, EmbedType.Success)],
		});
	},
} as JuanitaCommand;
