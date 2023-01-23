import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	RESUME_ALREADY_RESUMED_ERROR,
	RESUME_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'resume',
	description: 'Resume the current track!',
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

		const success = queue.setPaused(false);
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(RESUME_ALREADY_RESUMED_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		juanitaGuild.updateQueueMessage();
		return interaction.reply({
			embeds: [SimpleEmbed(`▶️ \`${queue.current.title}\` ${RESUME_SUCCESS[juanitaGuild.lang]}`, EmbedType.Success)],
		});
	},
} as JuanitaCommand;
