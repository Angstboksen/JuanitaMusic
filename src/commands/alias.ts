import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { saveAlias, listAliases, deleteAlias } from "../db/repositories/aliasRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "alias",
  description: "Manage playlist aliases for this server",
  options: [
    {
      name: "save",
      description: "Save a URL under an alias name",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Alias name (e.g. gym-playlist)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "url",
          description: "Playlist or track URL (Spotify, YouTube, SoundCloud, etc.)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "List all saved aliases for this server",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "delete",
      description: "Delete a saved alias",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Alias name to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],

  async execute({ interaction, lang }) {
    const sub = interaction.options.getSubcommand();

    if (sub === "save") {
      const name = interaction.options.getString("name", true);
      const url = interaction.options.getString("url", true);
      await saveAlias(interaction.guildId!, name, url);
      await interaction.reply({
        embeds: [simpleEmbed(`${msg.ALIAS_SAVED[lang]} \`${name}\` → \`${url}\``, EmbedType.Success)],
        ephemeral: true,
      });
      return;
    }

    if (sub === "list") {
      const aliasList = await listAliases(interaction.guildId!);
      if (aliasList.length === 0) {
        await interaction.reply({
          embeds: [simpleEmbed(msg.ALIAS_LIST_EMPTY[lang], EmbedType.Info)],
          ephemeral: true,
        });
        return;
      }

      const lines = aliasList.map((a) => `**${a.alias}** → \`${a.playlistId}\``).join("\n");
      const embed = new EmbedBuilder()
        .setColor("#0000ff")
        .setTitle(msg.ALIAS_LIST_TITLE[lang])
        .setDescription(lines);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === "delete") {
      const name = interaction.options.getString("name", true);
      const deleted = await deleteAlias(interaction.guildId!, name);
      if (!deleted) {
        await interaction.reply({
          embeds: [simpleEmbed(`${msg.ALIAS_NOT_FOUND[lang]} \`${name}\``, EmbedType.Error)],
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        embeds: [simpleEmbed(`${msg.ALIAS_DELETED[lang]} \`${name}\``, EmbedType.Success)],
        ephemeral: true,
      });
    }
  },
} as JuanitaCommand;
