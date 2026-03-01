import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type Message,
  type TextChannel,
} from "discord.js";
import type { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import type { Language } from "../i18n/types.js";
import {
  BTN_KYS, BTN_SKIP, BTN_PAUSE, BTN_RESUME, BTN_SHUFFLE,
  BTN_PREV_PAGE, BTN_NEXT_PAGE,
  QUEUE_NOW_PLAYING, QUEUE_ADDED_BY, QUEUE_TOTAL_TIME,
  QUEUE_SONG_COUNT, QUEUE_NEXT_SONG, QUEUE_EMPTY,
  QUEUE_SELECT_PLACEHOLDER, QUEUE_AUTHOR,
} from "../i18n/messages.js";
import { millisecondsToTime } from "../utils/time.js";

export interface QueueEmbedState {
  message: Message | null;
  interval: NodeJS.Timeout | null;
  page: number;
}

export function createQueueState(): QueueEmbedState {
  return { message: null, interval: null, page: 0 };
}

export function buildQueueEmbed(
  player: KazagumoPlayer,
  lang: Language,
  page: number,
  botAvatarUrl?: string,
) {
  const current = player.queue.current;
  if (!current) return null;

  const tracks = [...player.queue];
  const currentRemaining = Math.max((current.length ?? 0) - (player.shoukaku.position ?? 0), 0);
  const totalMs = currentRemaining + tracks.reduce((acc, t) => acc + (t.length ?? 0), 0);

  const nextSong = tracks.length > 0
    ? `[${tracks[0]!.title}](${tracks[0]!.uri})`
    : QUEUE_EMPTY[lang];

  const embed = new EmbedBuilder()
    .setColor("#0000ff")
    .setDescription(
      `${QUEUE_NOW_PLAYING[lang]} [${current.title}](${current.uri})\n` +
      `${QUEUE_ADDED_BY[lang]} ${current.requester ?? "Unknown"}\n`,
    )
    .setThumbnail(current.thumbnail ?? null)
    .setAuthor({ name: QUEUE_AUTHOR[lang], iconURL: botAvatarUrl })
    .addFields(
      { name: QUEUE_TOTAL_TIME[lang], value: `\`${millisecondsToTime(totalMs)}\``, inline: true },
      { name: QUEUE_SONG_COUNT[lang], value: `\`${tracks.length}\``, inline: true },
      { name: QUEUE_NEXT_SONG[lang], value: nextSong, inline: false },
    );

  const paused = player.paused;
  const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel(`💀${BTN_KYS[lang]}`).setStyle(ButtonStyle.Danger).setCustomId("btn:kys"),
    new ButtonBuilder().setLabel(`⏭️${BTN_SKIP[lang]}`).setStyle(ButtonStyle.Primary).setCustomId("btn:skip").setDisabled(tracks.length === 0),
    new ButtonBuilder().setLabel(paused ? `▶️${BTN_RESUME[lang]}` : `⏸️${BTN_PAUSE[lang]}`).setStyle(paused ? ButtonStyle.Success : ButtonStyle.Danger).setCustomId("btn:pause"),
    new ButtonBuilder().setLabel(`🔀${BTN_SHUFFLE[lang]}`).setStyle(ButtonStyle.Primary).setCustomId("btn:shuffle").setDisabled(tracks.length === 0),
  );

  if (tracks.length === 0) return { embed, components: [controlRow] };

  const maxPage = Math.ceil(tracks.length / 25);
  const pageSlice = tracks.slice(page * 25, (page + 1) * 25);

  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("queue_select")
      .setPlaceholder(`${QUEUE_SELECT_PLACEHOLDER[lang]} ${page * 25 + 1}/${Math.min((page + 1) * 25, tracks.length)}`)
      .addOptions(
        pageSlice.map((track, i) => ({
          label: `${page * 25 + i + 1}. ${track.title?.slice(0, 50) ?? "Unknown"}`,
          value: `${page * 25 + i}`,
        })),
      ),
  );

  const pageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("btn:prev_page").setLabel(`⬅️${BTN_PREV_PAGE[lang]}`).setStyle(ButtonStyle.Primary).setDisabled(page === 0),
    new ButtonBuilder().setCustomId("btn:next_page").setLabel(`➡️${BTN_NEXT_PAGE[lang]}`).setStyle(ButtonStyle.Primary).setDisabled(page >= maxPage - 1),
  );

  return { embed, components: [controlRow, selectMenu, pageRow] };
}

export async function sendOrUpdateQueueEmbed(
  state: QueueEmbedState,
  player: KazagumoPlayer,
  lang: Language,
  channel?: TextChannel,
  botAvatarUrl?: string,
) {
  const result = buildQueueEmbed(player, lang, state.page, botAvatarUrl);
  if (!result) {
    await cleanupQueueEmbed(state);
    return;
  }

  const { embed, components } = result;

  if (state.message) {
    try {
      await state.message.edit({ embeds: [embed], components });
    } catch {
      state.message = null;
    }
  } else if (channel) {
    state.message = await channel.send({ embeds: [embed], components });
  }
}

export async function cleanupQueueEmbed(state: QueueEmbedState) {
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
  if (state.message) {
    try { await state.message.delete(); } catch {}
    state.message = null;
  }
  state.page = 0;
}

export function startQueueInterval(
  state: QueueEmbedState,
  player: KazagumoPlayer,
  lang: Language,
  channel: TextChannel,
  botAvatarUrl?: string,
) {
  if (state.interval) clearInterval(state.interval);
  state.interval = setInterval(() => {
    sendOrUpdateQueueEmbed(state, player, lang, channel, botAvatarUrl);
  }, 4000);
}
