import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	PermissionsBitField,
} from "discord.js";
import type { JuanitaCommand } from "../types";

export default {
	name: "controller",
	description: "set controller channel ",
	voiceChannel: false,
	permissions: PermissionsBitField.Flags.ManageMessages,
	options: [
		{
			name: "channel",
			description: "the channel you want to send it to",
			type: ApplicationCommandOptionType.Channel,
			required: true,
		},
	],
	async execute({ interaction }) {
		if (!interaction.guild || !interaction.member)
			return interaction.reply({ content: "Something went wrong ❌", ephemeral: true });

		const channel = interaction.channel;
		if (!channel || channel.type !== ChannelType.GuildText)
			return interaction.reply({ content: `you have to send it to a text channel.. ❌`, ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle("control your music from the buttons below")
			.setImage(interaction.guild.iconURL({ size: 4096 }))
			.setColor("#36393e");

		interaction.reply({ content: `sending controller to ${channel}... ✅`, ephemeral: true });

		const leave = new ButtonBuilder()
			.setLabel("💀Kys")
			.setCustomId(JSON.stringify({ ffb: "leave" }))
			.setStyle(ButtonStyle.Danger);

		const skip = new ButtonBuilder()
			.setLabel("⏭️Skip")
			.setCustomId(JSON.stringify({ ffb: "skip" }))
			.setStyle(ButtonStyle.Success);

		const pause = new ButtonBuilder()
			.setLabel("⏸️Pause")
			.setCustomId(JSON.stringify({ ffb: "pause" }))
			.setStyle(ButtonStyle.Success);

		const shuffle = new ButtonBuilder()
			.setLabel("🎲Shuffle")
			.setCustomId(JSON.stringify({ ffb: "shuffle" }))
			.setStyle(ButtonStyle.Primary);

		const queuebutton = new ButtonBuilder()
			.setLabel("📝Queue")
			.setCustomId(JSON.stringify({ ffb: "queue" }))
			.setStyle(ButtonStyle.Primary);

		const row1 = new ActionRowBuilder().addComponents(leave, skip, pause, shuffle, queuebutton);

		return channel.send({ embeds: [embed], components: [row1 as any] });
	},
} as JuanitaCommand;
