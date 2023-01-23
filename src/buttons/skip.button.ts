import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	try {
		if (queue.tracks.length === 0) queue.destroy();
		else await queue.forceNext();
		juanitaGuild.updateQueueMessage();
		return interaction.deferUpdate();
	} catch (error) {
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});
	}
};
