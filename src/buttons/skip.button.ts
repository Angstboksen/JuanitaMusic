import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	SKIP_EMPTY_QUEUE,
	SKIP_FROM_SUCCESS,
	SKIP_TO_SUCCESS,
} from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const songFrom = queue.current.title;
	const songTo = queue.tracks.length === 0 ? SKIP_EMPTY_QUEUE[juanitaGuild.lang] : queue.tracks[0]!.title;

	try {
		if (queue.tracks.length === 0) queue.destroy();
		else await queue.forceNext();
		juanitaGuild.updateQueueMessage()
		return interaction.deferUpdate();
	} catch (error) {
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});
	}
};
