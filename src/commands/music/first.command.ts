import { QueryType } from "discord-player";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import SimpleEmbed, { EmbedType } from "../../embeds/embeds";
import {
	FIRST_PLAYLIST_NOT_SUPPORTED,
	GENERIC_CANT_JOIN_CHANNEL,
	GENERIC_ERROR,
	PLAY_NO_TRACKS_FOUND_ERROR,
} from "../../embeds/messages";
import type { JuanitaCommand } from "../types";

export default {
	name: "first",
	description: "Add a song to the top of the queue",
	voiceChannel: true,
	options: [
		{
			name: "song",
			description: "Song name or YouTube URL",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute({ interaction, player, client, lang }) {
		if (!interaction.guild || !interaction.guildId || !interaction.member || !player || !client)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		await interaction.deferReply({ ephemeral: true });
		const member = interaction.member as GuildMember;
		const song = (interaction.options as any).getString("song");
		const res = await player.search(song, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (!res || !res.tracks.length)
			return interaction.editReply({
				embeds: [SimpleEmbed(`${PLAY_NO_TRACKS_FOUND_ERROR[lang]} ${song}`, EmbedType.Error)],
			});

		if (res.playlist)
			return interaction.editReply({
				embeds: [SimpleEmbed(FIRST_PLAYLIST_NOT_SUPPORTED[lang], EmbedType.Error)],
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
				embeds: [SimpleEmbed(GENERIC_CANT_JOIN_CHANNEL[lang], EmbedType.Error)],
			});
		}
		
		const isPlaying = !!queue.current
		queue.insert(res.tracks[0]!, 0);
		if (!isPlaying) await queue.play();

		return await interaction.editReply({
			embeds: [SimpleEmbed(`Added \`${res.tracks[0]!.title}\` to the top of the queue!`, EmbedType.Success)],
		});
	},
} as JuanitaCommand;
