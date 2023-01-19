import { EmbedBuilder } from 'discord.js';
import { JuanitaCommand } from '../types';

export default {
	name: 'help',
	description: 'All the commands this bot has!',
	showHelp: false,

	execute({ interaction, client }) {
		if (!interaction.guildId || !client)
			return interaction.reply({ content: 'Something went wrong ❌', ephemeral: true });
		const commands = client.commands.filter((x) => x.showHelp !== false);

		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setAuthor({
				name: client.user!.username,
				iconURL: client.user!.displayAvatarURL({ size: 1024, forceStatic: false }),
			})
			.setDescription(
				'This code comes from a GitHub project [ZerioDev/Music-bot](https://github.com/ZerioDev/Music-bot).\nThe use of this one is possible while keeping the credits for free.\nIf you want to remove the credits join the Discord support server.',
			)
			.addFields([{ name: `Enabled - ${commands.size}`, value: commands.map((x) => `\`${x.name}\``).join(' | ') }])
			.setTimestamp()
			.setFooter({
				text: 'Music comes first - Made with heart by Zerio ❤️',
				iconURL: interaction.member?.avatar?.toString(),
			});

		return interaction.reply({ embeds: [embed] });
	},
} as JuanitaCommand;
