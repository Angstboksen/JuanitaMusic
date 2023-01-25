import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR, KYS_SUCCESS } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	queue.destroy();
	juanitaGuild.queue = null;
	juanitaGuild.removeQueueMessage();
	return interaction.reply({
		embeds: [SimpleEmbed(KYS_SUCCESS[juanitaGuild.lang], EmbedType.Success)],
	});
};
