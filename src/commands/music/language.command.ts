import { ApplicationCommandOptionType, CommandInteractionOptionResolver } from 'discord.js';
import type { ModelsLanguage } from '../../.generated/api/api';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { GENERIC_ERROR, JuanitaMessage, LANGUAGE_NOT_EXISTING_ERROR, LANGUAGE_SUCCESS } from '../../embeds/messages';
import { changeGuildLanguage } from '../../service/guildService';
import type { JuanitaCommand } from '../types';

export default {
	name: 'language',
	description: 'Change the main language for this guild!',
	voiceChannel: true,
	options: [
		{
			name: 'language',
			description: 'The language to use for this guild!',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute({ interaction, juanitaGuild }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const languages = [
			{ name: 'English', value: `\`en\`` },
			{ name: 'Norwegian', value: `\`no\`` },
			{ name: 'Molde', value: `\`molde\`` },
		];

		const language = (
			(interaction.options as CommandInteractionOptionResolver).getString('language') ?? ''
		).toLowerCase();

		const isSupported = languages.some((lang) => lang.value === `\`${language}\``);
		const supportedEmbed = SimpleEmbed(LANGUAGE_NOT_EXISTING_ERROR[juanitaGuild.lang], EmbedType.Error);
		supportedEmbed.addFields(languages);
		if (!isSupported)
			return interaction.reply({
				embeds: [supportedEmbed],
				ephemeral: true,
			});

		const updated = await changeGuildLanguage(interaction.guildId, language as ModelsLanguage);
		if (!updated)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		juanitaGuild.lang = language as keyof JuanitaMessage;
		return interaction.reply({
			embeds: [SimpleEmbed(`${LANGUAGE_SUCCESS[juanitaGuild.lang]} \`${language}\``, EmbedType.Success)],
			ephemeral: true,
		});
	},
} as JuanitaCommand;
