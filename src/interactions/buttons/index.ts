import type { ButtonInteraction } from "discord.js";
import type { JuanitaClient } from "../../client.js";
import type { GuildState } from "../../music/guildState.js";
import { simpleEmbed, EmbedType } from "../../embeds/simpleEmbed.js";
import { cleanupQueueEmbed, sendOrUpdateQueueEmbed } from "../../embeds/queueEmbed.js";
import * as msg from "../../i18n/messages.js";

type ButtonHandler = (
  interaction: ButtonInteraction,
  client: JuanitaClient,
  state: GuildState,
) => Promise<void>;

async function handleKys(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player) {
    await interaction.reply({ embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  await cleanupQueueEmbed(state.queueEmbed);
  player.destroy();
  await interaction.reply({ embeds: [simpleEmbed(`${msg.KYS_SUCCESS[state.lang]}`, EmbedType.Success)] });
}

async function handleSkip(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.skip();
  await interaction.deferUpdate();
}

async function handlePause(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.NO_MUSIC_PLAYING[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.pause(!player.paused);
  await interaction.deferUpdate();
}

async function handleShuffle(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player?.queue.current) {
    await interaction.reply({ embeds: [simpleEmbed(msg.GENERIC_ERROR[state.lang], EmbedType.Error)], ephemeral: true });
    return;
  }
  player.queue.shuffle();
  await interaction.deferUpdate();
}

async function handlePrevPage(interaction: ButtonInteraction, _client: JuanitaClient, state: GuildState) {
  if (state.queueEmbed.page > 0) state.queueEmbed.page--;
  await interaction.deferUpdate();
}

async function handleNextPage(interaction: ButtonInteraction, client: JuanitaClient, state: GuildState) {
  const player = client.getPlayer(interaction.guildId!);
  if (!player) return;
  const maxPage = Math.ceil([...player.queue].length / 25);
  if (state.queueEmbed.page < maxPage - 1) state.queueEmbed.page++;
  await interaction.deferUpdate();
}

export const buttonHandlers: Record<string, ButtonHandler> = {
  "btn:kys": handleKys,
  "btn:skip": handleSkip,
  "btn:pause": handlePause,
  "btn:shuffle": handleShuffle,
  "btn:prev_page": handlePrevPage,
  "btn:next_page": handleNextPage,
};
