import { QueryType } from 'discord-player';
import { ApplicationCommandOptionType, CommandInteractionOptionResolver, GuildMember, TextChannel } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_CANT_JOIN_CHANNEL,
	GENERIC_ERROR,
	PLAY_NO_TRACKS_FOUND_ERROR,
	PLAY_PLAYLIST_SUCCESS,
	PLAY_TRACK_SUCCESS,
	SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'spotify',
	description: 'Queue an entire spotify playlist!',
	voiceChannel: true,
	options: [
		{
			name: 'playlist',
			description: 'Stored alias or Spotify URI',
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
		const member = interaction.member as GuildMember;
		const playlist = (interaction.options as CommandInteractionOptionResolver).getString('playlist');
		if (!playlist)
			return interaction.editReply({
				embeds: [SimpleEmbed(SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});
		
		const aliasExists = await 

		return interaction.editReply({ embeds: [SimpleEmbed(playlist, EmbedType.Success)] });
	},
} as JuanitaCommand;
