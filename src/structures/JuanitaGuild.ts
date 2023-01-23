import type { Queue, Track } from 'discord-player';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message } from 'discord.js';
import {
	JuanitaMessage,
	QUEUE_ADDED_BY,
	QUEUE_AUTHOR_NAME,
	QUEUE_NOW_PLAYING,
	QUEUE_SELECT_PLACEHOLDER,
	QUEUE_SONG_AMOUNT,
	QUEUE_TOTAL_TIME,
} from '../embeds/messages';
import SimpleEmbed, { EmbedType } from '../embeds/embeds';
import { getSelectMenuByPage } from '../utils/array';
import { millisecondsToTime, timeToMilliseconds } from '../utils/time';
import type JuanitaClient from '../JuanitaClient';

export default class JuanitaGuild {
	public id: string;
	public queueMessage: Message | null = null;
	public queue: Queue | null = null;
	public interval: NodeJS.Timeout | null = null;
	public queuePage: number = 1;
	public lang: keyof JuanitaMessage = 'en';

	constructor(public client: JuanitaClient, public guild: Guild) {
		this.id = guild.id;
		this.guild = guild;
	}

	public setQueueMessage(message: Message) {
		this.queueMessage = message;
		this.queueMessage.edit({ content: 'test_queue' });
	}

	public async removeQueueMessage() {
		if (this.queueMessage) await this.queueMessage.delete();
		this.queueMessage = null;
	}

	public startInterval() {
		this.interval = setInterval(() => {
			if (this.queueMessage) this.queueMessage.edit({ content: 'test_queue' });
		}, 5000);
	}

	public stopInterval() {
		if (this.interval) clearInterval(this.interval);
	}

	public nextQueuePage() {
		this.queuePage++;
	}

	public previousQueuePage() {
		if (this.queuePage > 1) this.queuePage--;
	}

	public setLanguage(language: keyof JuanitaMessage) {
		this.lang = language;
	}

	public generateQueuePresentation(): [EmbedBuilder, ActionRowBuilder | null, ActionRowBuilder | null] {
		if (!this.queue) return [new EmbedBuilder(), new ActionRowBuilder(), new ActionRowBuilder()];
		const currentString = `${QUEUE_NOW_PLAYING[this.lang]} \`${this.queue.current.title}\`\n${`${
			QUEUE_ADDED_BY[this.lang]
		} ${this.queue.current.requestedBy}`}\n`;
		const currentTime =
			timeToMilliseconds(this.queue.getPlayerTimestamp().end) -
			timeToMilliseconds(this.queue.getPlayerTimestamp().current);
		const queueTime = this.queue.tracks.reduce((acc: number, track: Track) => acc + track.durationMS, 0);
		const embed = SimpleEmbed(`${currentString}\n${this.queue.createProgressBar()}`, EmbedType.Info)
			.setAuthor({
				name: QUEUE_AUTHOR_NAME[this.lang],
				iconURL: this.client.user!.displayAvatarURL(),
			})
			.addFields(
				{
					name: QUEUE_TOTAL_TIME[this.lang],
					value: `\`${millisecondsToTime(currentTime + queueTime)}\``,
					inline: true,
				},
				{ name: QUEUE_SONG_AMOUNT[this.lang], value: `\`${this.queue.tracks.length.toString()}\``, inline: true },
			);

		if (this.queue.tracks.length === 0) return [embed, null, null];
		const currentPage = this.queuePage;
		const maxPage = Math.ceil(this.queue.tracks.length / 25);
		const queueSelect = new ActionRowBuilder().addComponents(
			getSelectMenuByPage(this.queue.tracks, 1)
				.setPlaceholder(`${QUEUE_SELECT_PLACEHOLDER[this.lang]} ${currentPage}/${maxPage}`)
				.setCustomId('queue_select'),
		);
		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('queue_previous').setLabel('⬅️Previous').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('queue_next').setLabel('Next➡️').setStyle(ButtonStyle.Primary),
		);
		return [embed, queueSelect, buttons];
	}
}
