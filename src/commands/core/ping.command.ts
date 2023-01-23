import SimpleEmbed, { EmbedType } from '../../embeds/embeds';
import { GENERIC_ERROR } from '../../embeds/messages';
import type { JuanitaCommand } from '../types';

export default {
	name: 'ping',
	description: 'Get the ping of the bot!',
	async execute({ interaction, client, juanitaGuild }) {
		if (!client)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		return interaction.reply({
			embeds: [SimpleEmbed(`**Pong!** \`${Math.round(client.ws.ping)}ms\` 🛰️`, EmbedType.Info)],
		});
	},
} as JuanitaCommand;
