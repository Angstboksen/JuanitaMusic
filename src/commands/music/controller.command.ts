import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	PermissionsBitField,
} from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'controller',
	description: 'set controller channel ',
	voiceChannel: false,
	permissions: PermissionsBitField.Flags.ManageMessages,
	options: [
		{
			name: 'channel',
			description: 'the channel you want to send it to',
			type: ApplicationCommandOptionType.Channel,
			required: true,
		},
	],
	async execute({ interaction }) {
		if (!interaction.guild || !interaction.member)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const channel = interaction.channel;
		if (!channel || channel.type !== ChannelType.GuildText)
			return interaction.reply({ content: `you have to send it to a text channel.. ❌`, ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle('control your music from the buttons below')
			.setImage(interaction.guild.iconURL({ size: 4096 }))
			.setColor('#36393e')
			.setFooter({
				text: 'Music comes first - Made with heart by Zerio ❤️',
				iconURL: interaction.member!.avatar!.toString(),
			});

		interaction.reply({ content: `sending controller to ${channel}... ✅`, ephemeral: true });

		const back = new ButtonBuilder()
			.setLabel('Back')
			.setCustomId(JSON.stringify({ ffb: 'back' }))
			.setStyle(ButtonStyle.Primary);

		const skip = new ButtonBuilder()
			.setLabel('Skip')
			.setCustomId(JSON.stringify({ ffb: 'skip' }))
			.setStyle(ButtonStyle.Primary);

		const resumepause = new ButtonBuilder()
			.setLabel('Resume & Pause')
			.setCustomId(JSON.stringify({ ffb: 'resume&pause' }))
			.setStyle(ButtonStyle.Danger);

		const save = new ButtonBuilder()
			.setLabel('Save')
			.setCustomId(JSON.stringify({ ffb: 'savetrack' }))
			.setStyle(ButtonStyle.Success);

		const volumeup = new ButtonBuilder()
			.setLabel('Volume up')
			.setCustomId(JSON.stringify({ ffb: 'volumeup' }))
			.setStyle(ButtonStyle.Primary);

		const volumedown = new ButtonBuilder()
			.setLabel('Volume Down')
			.setCustomId(JSON.stringify({ ffb: 'volumedown' }))
			.setStyle(ButtonStyle.Primary);

		const loop = new ButtonBuilder()
			.setLabel('Loop')
			.setCustomId(JSON.stringify({ ffb: 'loop' }))
			.setStyle(ButtonStyle.Danger);

		const np = new ButtonBuilder()
			.setLabel('Now Playing')
			.setCustomId(JSON.stringify({ ffb: 'nowplaying' }))
			.setStyle(ButtonStyle.Secondary);

		const queuebutton = new ButtonBuilder()
			.setLabel('Queue')
			.setCustomId(JSON.stringify({ ffb: 'queue' }))
			.setStyle(ButtonStyle.Secondary);

		const row1 = new ActionRowBuilder().addComponents(back, queuebutton, resumepause, np, skip);
		const row2 = new ActionRowBuilder().addComponents(volumedown, loop, save, volumeup);

		return channel.send({ embeds: [embed], components: [row1 as any, row2] });
	},
} as JuanitaCommand;
