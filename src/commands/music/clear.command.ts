import SimpleEmbed, { EmbedType } from "../../embeds/embeds";
import { CLEAR_QUEUE_SUCCESS, GENERIC_ERROR, GENERIC_NO_MUSIC_PLAYING_ERROR } from "../../embeds/messages";
import type { JuanitaCommand } from "../types";

export default {
	name: "clear",
	description: "Clears the queue!",
	voiceChannel: true,

	async execute({ interaction, player, juanitaGuild }) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.current)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		queue.clear();
		juanitaGuild.updateQueueMessage();
		return interaction.reply({ embeds: [SimpleEmbed(CLEAR_QUEUE_SUCCESS[juanitaGuild.lang], EmbedType.Success)] });
	},
} as JuanitaCommand;
