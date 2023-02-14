import { ApplicationCommandOptionType, CommandInteractionOptionResolver, GuildMember, TextChannel } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_CANT_JOIN_CHANNEL,
	GENERIC_ERROR,
	SPOTIFY_LOADING_ALIAS,
	SPOTIFY_PLAYING_BY_ID,
	SPOTIFY_PLAYLIST_NOT_EXIST_ERROR,
	SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';
import { getAliasesByGuild } from '../../service/aliasService';
import { QueryType } from 'discord-player';
import { retrieveSpotifyPlaylistId, validateSpotifyURI } from '../../utils/spotify';

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
		const option = (interaction.options as CommandInteractionOptionResolver).getString('playlist');
		if (!option)
			return interaction.editReply({
				embeds: [SimpleEmbed(SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		const storedAliases = await getAliasesByGuild(interaction.guildId);
		const existingAlias = storedAliases.find((alias) => alias.alias === option);
		const retrivedId = retrieveSpotifyPlaylistId(option);
		if (!existingAlias && !retrivedId)
			return interaction.editReply({
				embeds: [SimpleEmbed(SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});
			
		const query = existingAlias ? existingAlias.playlistid : await validateSpotifyURI(retrivedId!);
		const res = await player.search(`https://open.spotify.com/playlist/${query}`, {
			requestedBy: member,
			searchEngine: QueryType.SPOTIFY_PLAYLIST,
		});

		if (!res || !res.tracks.length)
			return interaction.editReply({
				embeds: [SimpleEmbed(SPOTIFY_PLAYLIST_NOT_EXIST_ERROR[juanitaGuild.lang], EmbedType.Error)],
			});

		let queue = player.getQueue(interaction.guildId);
		if (!queue) {
			queue = player.createQueue(interaction.guild, {
				metadata: interaction.channel,
				spotifyBridge: client.config.opt.spotifyBridge,
				initialVolume: client.config.opt.defaultvolume,
				leaveOnEnd: client.config.opt.leaveOnEnd,
			});
		}

		try {
			if (!queue.connection) await queue.connect(member.voice.channel!);
		} catch {
			player.deleteQueue(interaction.guildId);
			return interaction.editReply({
				embeds: [SimpleEmbed(GENERIC_CANT_JOIN_CHANNEL[juanitaGuild.lang], EmbedType.Error)],
			});
		}

		const embed = existingAlias
			? SimpleEmbed(`${SPOTIFY_LOADING_ALIAS[juanitaGuild.lang]} \`${existingAlias.name}\``, EmbedType.Success)
			: SimpleEmbed(`${SPOTIFY_PLAYING_BY_ID[juanitaGuild.lang]} \`${query}\``, EmbedType.Success);

		const isPlaying = !!queue.current;
		queue.addTracks(res.tracks);
		if (!isPlaying) await queue.play();

		juanitaGuild.queue = queue;
		juanitaGuild.startInterval(interaction.channel as TextChannel);
		return interaction.editReply({ embeds: [embed] });
	},
} as JuanitaCommand;
