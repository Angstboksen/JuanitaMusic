import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { GENERIC_ERROR, LISTS_EMBED_TITLE, LISTS_NO_ALIASES_STORED } from '../../embeds/messages';
import { getAliasesByGuild } from '../../service/aliasService';
import type { JuanitaCommand } from '../types';

export default {
	name: 'lists',
	description: 'Shows a list of all stored spotify playlists and their alias!',

	async execute({ interaction, juanitaGuild }) {
		if (!interaction.guildId || !juanitaGuild)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const aliases = await getAliasesByGuild(interaction.guildId);
		if (!aliases.length)
			return interaction.reply({
				embeds: [SimpleEmbed(LISTS_NO_ALIASES_STORED[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const embed = SimpleEmbed(LISTS_EMBED_TITLE[juanitaGuild.lang], EmbedType.Info);
		const aliasObjects = aliases.map((alias) => ({ name: alias.name, value: `\`${alias.alias}\``, inline: true }));
        embed.addFields
		embed.addFields(aliasObjects);
		return interaction.reply({ embeds: [embed] });
	},
} as JuanitaCommand;
