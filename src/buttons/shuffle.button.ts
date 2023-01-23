import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const success = queue.shuffle();
	if (!success)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	return interaction.deferUpdate();
};
