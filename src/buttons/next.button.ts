import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR, QUEUE_NEXT_PAGE_ERROR } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const success = juanitaGuild.nextQueuePage();
	if (!success)
		return interaction.reply({
			embeds: [SimpleEmbed(QUEUE_NEXT_PAGE_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});
	juanitaGuild.updateQueueMessage();
	return interaction.deferUpdate();
};
