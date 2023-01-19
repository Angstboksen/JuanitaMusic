import { QueryType } from 'discord-player';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'playnext',
	description: 'song you want to playnext',
	voiceChannel: true,
	options: [
		{
			name: 'song',
			description: 'the song you want to playnext',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute({ interaction, player }) {
		if (!interaction.guildId || !interaction.member || !player)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });
		await interaction.deferReply({ ephemeral: true });
		const member = interaction.member as GuildMember;
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing)
			return interaction.editReply({
				content: `No music currently playing ${member}... try again ? ❌`,
			});

		const song = (interaction.options as any).getString('song');

		const res = await player.search(song, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (!res || !res.tracks.length)
			return interaction.editReply({
				content: `No results found ${member}... try again ? ❌`,
			});

		if (res.playlist)
			return interaction.editReply({
				content: `This command dose not support playlist's ${member}... try again ? ❌`,
			});

		queue.insert(res.tracks[0]!, 0);

		return await interaction.editReply({ content: `Track has been inserted into the queue... it will play next 🎧` });
	},
} as JuanitaCommand;
