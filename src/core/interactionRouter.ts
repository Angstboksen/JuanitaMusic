import { GuildMember, Interaction, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { getOrCreateGuildState } from "../music/guildState.js";

export function setupInteractionHandler(client: JuanitaClient) {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.guild || !interaction.guildId) return;

    const state = await getOrCreateGuildState(interaction.guildId, interaction.guild.name);

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({
          embeds: [simpleEmbed(msg.COMMAND_NOT_FOUND[state.lang], EmbedType.Error)],
          ephemeral: true,
        });
        return;
      }

      // Voice channel check
      if (command.voiceChannel) {
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          await interaction.reply({
            embeds: [simpleEmbed(msg.NOT_IN_VOICE[state.lang], EmbedType.Error)],
            ephemeral: true,
          });
          return;
        }
        if (
          interaction.guild.members.me?.voice.channel &&
          member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
        ) {
          await interaction.reply({
            embeds: [simpleEmbed(msg.NOT_IN_SAME_VOICE[state.lang], EmbedType.Error)],
            ephemeral: true,
          });
          return;
        }
      }

      try {
        await command.execute({ interaction, client, lang: state.lang });
      } catch (error) {
        console.error(`[Command Error] ${interaction.commandName}:`, error);
        const reply = interaction.deferred || interaction.replied
          ? interaction.editReply.bind(interaction)
          : interaction.reply.bind(interaction);
        await reply({
          embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)],
          ephemeral: true,
        }).catch(() => {});
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      const handler = (await import("../interactions/buttons/index.js")).buttonHandlers[buttonId];
      if (handler) {
        await handler(interaction, client, state);
      }
      return;
    }

  });
}
