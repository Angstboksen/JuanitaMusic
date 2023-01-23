import { GuildMember, Interaction, InteractionType } from 'discord.js';
import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import {
	COMMAND_NOT_FOUND_ERROR,
	GENERIC_ERROR,
	USER_NOT_IN_SAME_VOICE,
	USER_NOT_IN_VOICE,
} from '../embeds/messages';
import type JuanitaClient from '../JuanitaClient';

export default (client: JuanitaClient, interaction: Interaction) => {
	if (!interaction.isCommand() && !interaction.isMessageComponent()) return;
	if (!interaction.guild || !interaction.guildId)
		return interaction.reply({
			embeds: [SimpleEmbed(GENERIC_ERROR['en'], EmbedType.Error)],
			ephemeral: true,
		});

	const juanitaGuildExist = client.guildCommander.has(interaction.guildId);
	const juanitaGuild = juanitaGuildExist
		? client.getJuanitaGuild(interaction.guildId)
		: client.setJuanitaGuild(interaction.guildId, interaction.guild);

	if (interaction.type === InteractionType.ApplicationCommand) {
		const command = client.commands.get(interaction.commandName);
		if (!command)
			return interaction.reply({
				embeds: [SimpleEmbed(COMMAND_NOT_FOUND_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		console.log(`[COMMAND]: Executed "${interaction.commandName}" by "${interaction.user.tag}"`);
		const member = interaction.member as GuildMember;
		if (command.voiceChannel) {
			if (!member.voice.channel)
				return interaction.reply({
					embeds: [SimpleEmbed(USER_NOT_IN_VOICE[juanitaGuild.lang], EmbedType.Error)],
					ephemeral: true,
				});
			if (
				interaction.guild?.members.me?.voice.channel &&
				member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
			)
				return interaction.reply({
					embeds: [SimpleEmbed(USER_NOT_IN_SAME_VOICE[juanitaGuild.lang], EmbedType.Error)],
					ephemeral: true,
				});
		}
		try {
			command.execute({ interaction, client, player: client.player, juanitaGuild });
		} catch (error) {
			console.error(error);
			interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});
		}
	}

	if (interaction.type === InteractionType.MessageComponent) {
		if (!interaction.guild || !interaction.guildId)
			return interaction.reply({
				embeds: [SimpleEmbed(GENERIC_ERROR[juanitaGuild.lang], EmbedType.Error)],
				ephemeral: true,
			});

		const customId = JSON.parse(interaction.customId);
		console.log(`[BUTTON]: Executed "${customId.ffb}" by "${interaction.user.tag}"`);
		const file_of_button = customId.ffb;
		const queue = client.player.getQueue(interaction.guildId!);
		if (file_of_button) {
			delete require.cache[require.resolve(`../buttons/${file_of_button}.button.ts`)];
			const button = require(`../buttons/${file_of_button}.button.ts`).default;
			if (button) return button({ client, interaction, customId, queue, juanitaGuild });
		}
	}
};
