import type { StringSelectMenuInteraction } from "discord.js";
import type { JuanitaClient } from "../../client.js";
import type { GuildState } from "../../music/guildState.js";
import { simpleEmbed, EmbedType } from "../../embeds/simpleEmbed.js";
import * as msg from "../../i18n/messages.js";

export default async function handleQueueSelect(
  interaction: StringSelectMenuInteraction,
  client: JuanitaClient,
  state: GuildState,
) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({
      embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)],
      ephemeral: true,
    });
    return;
  }

  const value = parseInt(interaction.values[0]!);
  if (isNaN(value) || value < 0 || value >= [...player.queue].length) {
    await interaction.reply({
      embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)],
      ephemeral: true,
    });
    return;
  }

  // Remove all tracks before the selected one, then skip current
  player.queue.splice(0, value);
  player.skip();
  state.queueEmbed.page = 0;
  await interaction.deferUpdate();
}
