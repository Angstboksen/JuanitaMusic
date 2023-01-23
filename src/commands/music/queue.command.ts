import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	GENERIC_NO_TEXT_CHANNEL,
	QUEUE_SILENT_SUCCESS,
} from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'queue',
	description: 'Get a list of all the songs in the queue!',
	voiceChannel: true,

	async execute({ interaction, player, client, juanitaGuild }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		juanitaGuild.queue = queue;

		//const songs = queue.tracks.length;
		// const nextSongs = songs > 5 ? `And **${songs - 5}** other song(s)...` : `In the playlist **${songs}** song(s)...`;
		// const tracks = queue.tracks.map(
		// 	(track, i) => `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.username})`,
		// );

		const channel = interaction.channel;
		if (!channel) {
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_TEXT_CHANNEL[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		}
		const [embed, buttons, queueSelect, queueButtons] = juanitaGuild.generateQueuePresentation();

		await interaction.reply({
			embeds: [SimpleEmbed(QUEUE_SILENT_SUCCESS[juanitaGuild.lang], EmbedType.Success)],
			ephemeral: true,
		});
		await juanitaGuild.removeQueueMessage();
		const message =
			queueSelect && queueButtons
				? await channel.send({ embeds: [embed], components: [buttons as any, queueSelect, queueButtons] })
				: await channel.send({ embeds: [embed], components: [buttons as any] });
		return juanitaGuild.setQueueMessage(message);
	},
} as JuanitaCommand;
