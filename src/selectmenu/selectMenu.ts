import type { StringSelectMenuInteraction } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR } from '../embeds/messages';
import type JuanitaClient from '../JuanitaClient';
import type JuanitaGuild from '../structures/JuanitaGuild';

type JuanitaSelectMenuOptions = {
	client: JuanitaClient;
	interaction: StringSelectMenuInteraction;
	juanitaGuild: JuanitaGuild;
};

export default async ({ interaction, juanitaGuild }: JuanitaSelectMenuOptions) => {
	if (!interaction.values || !interaction.values[0] || !juanitaGuild)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const queue = juanitaGuild.queue;
	if (!queue || !queue.current)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	const value = parseInt(interaction.values[0]);
	if (isNaN(value) || !juanitaGuild.validateSelectMenuValue(value))
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			ephemeral: true,
		});

	queue.tracks = queue.tracks.slice(value);
	await queue.forceNext();
    juanitaGuild.queuePage = 0
	juanitaGuild.updateQueueMessage();
	return interaction.deferUpdate();
};
