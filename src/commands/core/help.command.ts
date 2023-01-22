import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import type { JuanitaCommand } from '../types';
import { GENERIC_ERROR, HELP_COMMAND_AMOUNT, HELP_COMMAND_DESCRIPTION } from '../../embeds/messages';

export default {
	name: 'help',
	description: 'Shows the commands this bot has!',
	showHelp: false,

	execute({ interaction, client, lang }) {
		if (!interaction.guildId || !client)
			return interaction.reply({ embeds: [SimpleEmbed(GENERIC_ERROR[lang], EmbedType.Error)], ephemeral: true });
		const commands = client.commands.filter((x) => x.showHelp !== false);

		const embed = SimpleEmbed(HELP_COMMAND_DESCRIPTION[lang], EmbedType.Info).addFields([
			{
				name: `${HELP_COMMAND_AMOUNT[lang]} ${commands.size}`,
				value: commands.map((x) => `\`${x.name}\``).join(' | '),
			},
		]);

		return interaction.reply({ embeds: [embed] });
	},
} as JuanitaCommand;
