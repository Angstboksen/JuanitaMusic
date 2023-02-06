import { QueryType } from 'discord-player';
import { ApplicationCommandOptionType, CommandInteractionOptionResolver, GuildMember, TextChannel } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_CANT_JOIN_CHANNEL,
	GENERIC_ERROR,
	PLAY_NO_TRACKS_FOUND_ERROR,
	PLAY_PLAYLIST_SUCCESS,
	PLAY_TRACK_SUCCESS,
	REMEMBER_OPTIONS_ERROR,
	REMEMBER_SPOTIFY_FORMAT_ERROR,
	REMEMBER_SUCCESS_ONE,
	REMEMBER_SUCCESS_TWO,
} from '../../embeds/messages';
import { createAlias, validateAlias } from '../../service/aliasService';
import type { JuanitaCommand } from '../types';

export default {
	name: 'remember',
	description: 'Store a spotify playlist with an alias!',
	options: [
		{
			name: 'playlistURI',
			description: 'The URI of the playlist you want to store',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'alias',
			description: 'The alias to store the playlist under',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute({ interaction, player, client, juanitaGuild }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		await interaction.deferReply({ ephemeral: true });

		const uri = (interaction.options as CommandInteractionOptionResolver).getString('playlistURI');
		const alias = (interaction.options as CommandInteractionOptionResolver).getString('alias');
		if (!uri || !alias)
			return interaction.editReply({
				embeds: [SimpleEmbed(REMEMBER_OPTIONS_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		if (!uri.startsWith('spotify:playlist:'))
			return interaction.editReply({
				embeds: [SimpleEmbed(REMEMBER_SPOTIFY_FORMAT_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		const alreadyExists = await validateAlias(interaction.guildId, alias);
		if (alreadyExists)
			return interaction.editReply({
				embeds: [SimpleEmbed(REMEMBER_OPTIONS_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		const created = await createAlias(interaction.guildId, alias, uri[2]!);
		if (!created)
			return interaction.editReply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		return interaction.editReply({
			embeds: [
				SimpleEmbed(
					`${REMEMBER_SUCCESS_ONE[juanitaGuild.lang]} \`${created.name}\` ${
						REMEMBER_SUCCESS_TWO[juanitaGuild.lang]
					} \`${created.alias}\``,
					EmbedType.Success,
				),
			],
		});
	},
} as JuanitaCommand;
