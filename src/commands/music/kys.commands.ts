import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR, KYS_SUCCESS } from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'kys',
	description: 'Forces the bot to leave the channel!',
	voiceChannel: true,

	execute({ interaction, player, juanitaGuild }) {
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

		queue.destroy();

		return interaction.reply({ embeds: [SimpleEmbed(KYS_SUCCESS[juanitaGuild.lang], EmbedType.Success)] });
	},
} as JuanitaCommand;
