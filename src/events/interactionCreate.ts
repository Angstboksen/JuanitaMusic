import { EmbedBuilder, GuildMember, Interaction, InteractionType } from 'discord.js';
import type JuanitaClient from '../JuanitaClient';

export default (client: JuanitaClient, interaction: Interaction) => {
	if (interaction.type === InteractionType.ApplicationCommand) {
		const command = client.commands.get(interaction.commandName);
		const member = interaction.member as GuildMember;
		if (command.voiceChannel) {
			if (!member.voice.channel)
				return interaction.reply({
					embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`❌ You are not in a Voice Channel`)],
					ephemeral: true,
				});
			if (
				interaction.guild?.members.me?.voice.channel &&
				member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
			)
				return interaction.reply({
					embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`❌ You are not in the same Voice Channel`)],
					ephemeral: true,
				});
		}
		command.execute({ interaction, client, player: client.player });
	}

	if (interaction.type === InteractionType.MessageComponent) {
		const customId = JSON.parse(interaction.customId);
		const file_of_button = customId.ffb;
		const queue = client.player.getQueue(interaction.guildId!);
		if (file_of_button) {
			delete require.cache[require.resolve(`../buttons/${file_of_button}.button.ts`)];
			const button = require(`../buttons/${file_of_button}.button.ts`).default;
			if (button) return button({ client, interaction, customId, queue });
		}
	}
};
