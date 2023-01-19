import { QueryType } from 'discord-player';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'play',
	description: 'play a song!',
	voiceChannel: true,
	options: [
		{
			name: 'song',
			description: 'the song you want to play',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute({ interaction, player, client }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });
		await interaction.deferReply({ ephemeral: true });
		const member = interaction.member as GuildMember;
		const song = (interaction.options as any).getString('song');
		const res = await player.search(song, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (!res || !res.tracks.length)
			return interaction.editReply({
				content: `No results found ${member}... try again ? ❌`,
			});

		const queue = player.createQueue(interaction.guild, {
			metadata: interaction.channel,
			spotifyBridge: client.config.opt.spotifyBridge,
			initialVolume: client.config.opt.defaultvolume,
			leaveOnEnd: client.config.opt.leaveOnEnd,
		});

		try {
			if (!queue.connection) await queue.connect(member.voice.channel!);
		} catch {
			player.deleteQueue(interaction.guildId);
			return interaction.editReply({
				content: `I can't join the voice channel ${interaction.member}... try again ? ❌`,
			});
		}

		await interaction.editReply({ content: `Loading your ${res.playlist ? 'playlist' : 'track'}... 🎧` });

		res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]!);

		if (!queue.playing) await queue.play();
		return;
	},
} as JuanitaCommand;
