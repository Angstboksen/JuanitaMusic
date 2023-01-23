import { QueryType } from 'discord-player';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_CANT_JOIN_CHANNEL,
	GENERIC_ERROR,
	PLAY_NO_TRACKS_FOUND_ERROR,
	PLAY_PLAYLIST_SUCCESS,
	PLAY_TRACK_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'play',
	description: 'Play a song based on search words or YouTube URL!',
	voiceChannel: true,
	options: [
		{
			name: 'song',
			description: 'Song name or YouTube URL',
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
		const song = (interaction.options as any).getString('song');
		const res = await player.search(song, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (!res || !res.tracks.length)
			return interaction.editReply({
				embeds: [SimpleEmbed(`${PLAY_NO_TRACKS_FOUND_ERROR[juanitaGuild.lang]} ${song}`, EmbedType.Error)],
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

		const embed = res.playlist
			? SimpleEmbed(`${PLAY_PLAYLIST_SUCCESS[juanitaGuild.lang]} \`${res.playlist.title}\``, EmbedType.Success)
			: SimpleEmbed(`${PLAY_TRACK_SUCCESS[juanitaGuild.lang]} \`${res.tracks[0]!.title}\``, EmbedType.Success);

		const isPlaying = !!queue.current;
		res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]!);
		if (!isPlaying) await queue.play();
		
		juanitaGuild.updateQueueMessage();
		return interaction.editReply({ embeds: [embed] });
	},
} as JuanitaCommand;
