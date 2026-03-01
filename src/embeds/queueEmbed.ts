import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Message,
  type TextChannel,
} from "discord.js";
import type { KazagumoPlayer } from "kazagumo";
import type { Language } from "../i18n/types.js";
import {
  BTN_KYS, BTN_SKIP, BTN_PAUSE, BTN_RESUME, BTN_SHUFFLE, BTN_BACK,
  QUEUE_NOW_PLAYING, QUEUE_ADDED_BY, QUEUE_EMPTY, QUEUE_UP_NEXT,
} from "../i18n/messages.js";
import { millisecondsToTime, buildProgressBar } from "../utils/time.js";

const MAX_QUEUE_DISPLAY = 8;

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
  _page: number,
  botAvatarUrl?: string,
) {
  const current = player.queue.current;
  if (!current) return null;

  const tracks = [...player.queue];
  const position = player.shoukaku.position ?? 0;
  const duration = current.length ?? 0;
  const paused = player.paused;

  // Build description
  const lines: string[] = [];

  // Now playing — title as hero
  lines.push(`${QUEUE_NOW_PLAYING[lang]}`);
  lines.push(`**[${current.title}](${current.uri})**`);
  lines.push(`${QUEUE_ADDED_BY[lang]} ${current.requester ?? "Unknown"}`);
  lines.push("");

  // Progress bar
  lines.push(buildProgressBar(position, duration, paused));
  lines.push("");

  // Up next section
  if (tracks.length > 0) {
    const queueTotalMs = tracks.reduce((acc, t) => acc + (t.length ?? 0), 0);
    lines.push(`**${QUEUE_UP_NEXT[lang]}** (${tracks.length} songs · ${millisecondsToTime(queueTotalMs)})`);

    const displayed = tracks.slice(0, MAX_QUEUE_DISPLAY);
    for (let i = 0; i < displayed.length; i++) {
      const t = displayed[i]!;
      const dur = t.length ? millisecondsToTime(t.length) : "?:??";
      lines.push(`\`${i + 1}.\` ${t.title?.slice(0, 45) ?? "Unknown"} — ${dur}`);
    }

    if (tracks.length > MAX_QUEUE_DISPLAY) {
      lines.push(`*...and ${tracks.length - MAX_QUEUE_DISPLAY} more*`);
    }
  } else {
    lines.push(QUEUE_EMPTY[lang]);
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setDescription(lines.join("\n"))
    .setThumbnail(current.thumbnail ?? null)
    .setAuthor({ name: "Juanita", iconURL: botAvatarUrl });

  // Single row of controls
  const previousTracks = player.queue.previous;
  const hasPrevious = Array.isArray(previousTracks) ? previousTracks.length > 0 : !!previousTracks;

  const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("btn:back").setLabel(BTN_BACK[lang]).setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(!hasPrevious),
    new ButtonBuilder().setCustomId("btn:skip").setLabel(BTN_SKIP[lang]).setEmoji("⏭️").setStyle(ButtonStyle.Primary).setDisabled(tracks.length === 0),
    new ButtonBuilder().setCustomId("btn:pause").setLabel(paused ? BTN_RESUME[lang] : BTN_PAUSE[lang]).setEmoji(paused ? "▶️" : "⏸️").setStyle(paused ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("btn:shuffle").setLabel(BTN_SHUFFLE[lang]).setEmoji("🔀").setStyle(ButtonStyle.Secondary).setDisabled(tracks.length < 2),
    new ButtonBuilder().setCustomId("btn:kys").setLabel(BTN_KYS[lang]).setEmoji("💀").setStyle(ButtonStyle.Danger),
  );

  return { embed, components: [controlRow] };
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
