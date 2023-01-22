import { EmbedBuilder } from "discord.js";
import type { JuanitaButtonOptions } from "./types";

export default async ({ client, interaction, queue }: JuanitaButtonOptions) => {
	if (!queue || !queue.playing)
		return interaction.reply({ content: `No music currently playing... try again ? ❌`, ephemeral: true });

	if (!queue.tracks[0])
		return interaction.reply({
			content: `No music in the queue after the current one ${interaction.member}... try again ? ❌`,
			ephemeral: true,
		});

	const methods = ["", "🔁", "🔂"];

	const songs = queue.tracks.length;

	const nextSongs = songs > 5 ? `And **${songs - 5}** other song(s)...` : `In the playlist **${songs}** song(s)...`;

	const tracks = queue.tracks.map(
		(track, i) => `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.username})`,
	);

	const embed = new EmbedBuilder()
		.setColor("#ff0000")
		.setThumbnail(interaction.guild!.iconURL({ size: 2048, forceStatic: false }))
		.setAuthor({
			name: `Server queue - ${interaction.guild!.name} ${methods[queue.repeatMode]}`,
			iconURL: client.user!.displayAvatarURL({ size: 1024, forceStatic: false }),
		})
		.setDescription(`Current ${queue.current.title}\n\n${tracks.slice(0, 5).join("\n")}\n\n${nextSongs}`)
		.setTimestamp();

	return interaction.reply({ embeds: [embed], ephemeral: true });
};
