import { QueueRepeatMode } from "discord-player";
import { ApplicationCommandOptionType } from "discord.js";
import SimpleEmbed, { EmbedType } from "../../embeds/embeds";
import {
	GENERIC_ERROR,
	GENERIC_NO_MUSIC_PLAYING_ERROR,
	LOOP_OFF_EMBED_SUCCESS,
	LOOP_QUEUE_EMBED_SUCCESS,
	LOOP_TRACK_EMBED_SUCCESS,
} from "../../embeds/messages";
import type { JuanitaCommand } from "../types";

export default {
	name: "loop",
	description: "Enable or disable looping of songs or the entire queue",
	voiceChannel: true,
	options: [
		{
			name: "action",
			description: "What action you want to preform on the loop",
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{ name: "Song", value: "enable_loop_song" },
				{ name: "Queue", value: "enable_loop_queue" },
				{ name: "Disable", value: "disable_loop" },
			],
		},
	],
	execute({ interaction, player, juanitaGuild}) {
		if (!interaction.guildId || !player)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)], ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.current)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_NO_MUSIC_PLAYING_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		let embed = SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error);
		switch ((interaction.options as any)._hoistedOptions.map((x: any) => x.value).toString()) {
			case "enable_loop_song":
				const success = queue.setRepeatMode(QueueRepeatMode.TRACK);
				if (success) embed = SimpleEmbed(`${LOOP_TRACK_EMBED_SUCCESS[juanitaGuild.lang]} ${queue.current.title}`, EmbedType.Success);
				break;

			case "enable_loop_queue": {
				const success = queue.setRepeatMode(QueueRepeatMode.QUEUE);
				if (success) embed = SimpleEmbed(LOOP_QUEUE_EMBED_SUCCESS[juanitaGuild.lang], EmbedType.Success);
				break;
			}
			case "disable_loop": {
				const success = queue.setRepeatMode(QueueRepeatMode.OFF);
				if (success) embed = SimpleEmbed(LOOP_OFF_EMBED_SUCCESS[juanitaGuild.lang], EmbedType.Success);
				break;
			}
			default:
				embed = SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error);
				break;
		}
		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
} as JuanitaCommand;
