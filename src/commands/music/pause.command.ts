import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	PAUSE_ALREADY_PAUSED_ERROR,
	PAUSE_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'pause',
	description: 'Pause the current track!',
	voiceChannel: true,

	execute({ interaction, player, juanitaGuild }) {
		if (!interaction.guildId || !player)
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

		const success = queue.setPaused(true);
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(PAUSE_ALREADY_PAUSED_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		juanitaGuild.updateQueueMessage();
		return interaction.reply({
			embeds: [SimpleEmbed(`⏸ \`${queue.current.title}\` ${PAUSE_SUCCESS[juanitaGuild.lang]}`, EmbedType.Success)],
			ephemeral: true,
		});
	},
} as JuanitaCommand;
