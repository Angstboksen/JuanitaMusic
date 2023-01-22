import type { Track } from 'discord-player';
import { ActionRowBuilder } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	QUEUE_ADDED_BY,
	QUEUE_AUTHOR_NAME,
	QUEUE_NOW_PLAYING,
	QUEUE_SELECT_PLACEHOLDER,
	QUEUE_SONG_AMOUNT,
	QUEUE_TOTAL_TIME,
} from '../../embeds/messages';
import { getSelectMenuByPage } from '../../utils/array';
import { millisecondsToTime, timeToMilliseconds } from '../../utils/time';
import type { JuanitaCommand } from '../types';

export default {
	name: 'queue',
	description: 'Get a list of all the songs in the queue!',
	voiceChannel: true,

	execute({ interaction, player, client, lang }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		//const songs = queue.tracks.length;
		// const nextSongs = songs > 5 ? `And **${songs - 5}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
		// const tracks = queue.tracks.map(
		// 	(track, i) => `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.username})`,
		// );

		const currentString = `${QUEUE_NOW_PLAYING[lang]} \`${
			queue.current.title
		}\`\n${`${QUEUE_ADDED_BY[lang]} ${queue.current.requestedBy}`}\n`;
		const progressBar = queue.createProgressBar();
		const amountOfSongs = queue.tracks.length;
		const currentTime =
			timeToMilliseconds(queue.getPlayerTimestamp().end) - timeToMilliseconds(queue.getPlayerTimestamp().current);
		const queueTime = queue.tracks.reduce((acc: number, track: Track) => acc + track.durationMS, 0);
		const totalQueueTime = millisecondsToTime(currentTime + queueTime);
		const desc = `${currentString}\n${progressBar}`;
		const embed = SimpleEmbed(desc, EmbedType.Info)
			.setAuthor({
				name: QUEUE_AUTHOR_NAME[lang],
				iconURL: client.user!.displayAvatarURL(),
			})
			.addFields(
				{ name: QUEUE_TOTAL_TIME[lang], value: `\`${totalQueueTime}\``, inline: true },
				{ name: QUEUE_SONG_AMOUNT[lang], value: `\`${amountOfSongs.toString()}\``, inline: true },
			);

		if (queue.tracks.length === 0) return interaction.reply({ embeds: [embed] });

		const queueSelect = new ActionRowBuilder().addComponents(
			getSelectMenuByPage(queue.tracks, 1).setPlaceholder(QUEUE_SELECT_PLACEHOLDER[lang]).setCustomId('queue_select'),
		);
		return interaction.reply({ embeds: [embed], components: [queueSelect as any] });
	},
} as JuanitaCommand;
