import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR, SHUFFLE_SUCCESS } from '../embeds/messages';
import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue, juanitaGuild }: JuanitaButtonOptions) => {
	if (!queue || !queue.playing)
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

	return interaction.reply({ embeds: [SimpleEmbed(SHUFFLE_SUCCESS[juanitaGuild.lang], EmbedType.Success)] });
};
