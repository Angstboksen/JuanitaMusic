import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import type { JuanitaCommand } from '../types';

export default {
	name: 'nowplaying',
	description: 'veiw what is playing!',
	voiceChannel: true,

	execute({ interaction, player, client }) {
		if (!interaction.guildId || !player || !client)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });

		const queue = player.getQueue(interaction.guildId);
		if (!queue)
			return interaction.reply({
				content: `No music currently playing ${interaction.member}... try again ? ❌`,
				ephemeral: true,
			});

		const track = queue.current;
		const methods = ['disabled', 'track', 'queue'];
		const timestamp = queue.getPlayerTimestamp();
		const trackDuration = timestamp.progress == Infinity ? 'infinity (live)' : track.duration;
		const progress = queue.createProgressBar();

		const embed = new EmbedBuilder()
			.setAuthor({ name: track.title, iconURL: client.user!.displayAvatarURL({ size: 1024, forceStatic: false }) })
			.setThumbnail(track.thumbnail)
			.setDescription(
				`Volume **${queue.volume}**%\nDuration **${trackDuration}**\nProgress ${progress}\nLoop mode **${
					methods[queue.repeatMode]
				}**\nRequested by ${track.requestedBy}`,
			)
			.setFooter({
				text: 'Music comes first - Made with heart by Zerio ❤️',
				iconURL: interaction.member!.avatar!.toString(),
			})
			.setColor('#ff0000')
			.setTimestamp();

		const saveButton = new ButtonBuilder()
			.setLabel('Save this track')
			.setCustomId(JSON.stringify({ ffb: 'savetrack' }))
			.setStyle(ButtonStyle.Danger);

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

		const resumepause = new ButtonBuilder()
			.setLabel('Resume & Pause')
			.setCustomId(JSON.stringify({ ffb: 'resume&pause' }))
			.setStyle(ButtonStyle.Success);

		const row = new ActionRowBuilder().addComponents(volumedown, saveButton, resumepause, loop, volumeup);

		return interaction.reply({ embeds: [embed], components: [row as any] });
	},
} as JuanitaCommand;
