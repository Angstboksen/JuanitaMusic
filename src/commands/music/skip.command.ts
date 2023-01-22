import SimpleEmbed, { EmbedType } from "../../embeds/embeds";
import { GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR, SKIP_SUCCESS } from "../../embeds/messages";
import type { JuanitaCommand } from "../types";

export default {
	name: "skip",
	description: "Skips to the next song in the queue!",
	voiceChannel: true,

	async execute({ interaction, player, lang }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.current)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		const success = queue.skip();
		if (!success)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)],
				ephemeral: true,
			});

		return interaction.reply({
			embeds: [
				SimpleEmbed(
					`${SKIP_SUCCESS[lang]} \`${queue.current.title}\``,
					EmbedType.Success,
				),
			],
		});
	},
} as JuanitaCommand;
