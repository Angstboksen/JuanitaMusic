import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_NO_MUSIC_PLAYING_ERROR } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const success = queue.setPaused(true);
	if (!success) queue.setPaused(false);

	juanitaGuild.updateQueueMessage();
	return interaction.deferUpdate();
};
