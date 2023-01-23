import type { Queue, Track } from 'discord-player';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message } from 'discord.js';
import {
	JuanitaMessage,
	KYS_BUTTON_LABEL,
	NEXT_BUTTON_LABEL,
	PAUSE_BUTTON_LABEL,
	PREVIOUS_BUTTON_LABEL,
	QUEUE_ADDED_BY,
	QUEUE_AUTHOR_NAME,
	QUEUE_NOW_PLAYING,
	QUEUE_SELECT_PLACEHOLDER,
	QUEUE_SONG_AMOUNT,
	QUEUE_TOTAL_TIME,
	RESUME_BUTTON_LABEL,
	SHUFFLE_BUTTON_LABEL,
	SKIP_BUTTON_LABEL,
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
		this.stopInterval();
		this.startInterval();
	}

	public async updateQueueMessage() {
		if (!this.queueMessage) return;
		if (!this.queue || (!this.queue.current && !this.queue.tracks.length)) {
			await this.queueMessage.delete();
			this.queueMessage = null;
			return;
		}
		const [embed, buttons, queueSelect, queueButtons] = this.generateQueuePresentation();
		if (queueSelect && queueButtons)
			return await this.queueMessage.edit({ embeds: [embed], components: [queueSelect as any, buttons] });
		return await this.queueMessage.edit({ embeds: [embed] });
	}

	public async removeQueueMessage() {
		if (this.queueMessage) await this.queueMessage.delete();
		this.queueMessage = null;
	}

	public startInterval() {
		this.interval = setInterval(() => {
			this.updateQueueMessage();
		}, 2000);
	}

	public stopInterval() {
		if (this.interval) clearInterval(this.interval);
	}

	public nextQueuePage(): boolean {
		if (this.queuePage * 25 > this.queue!.tracks.length) return false;
		this.queuePage++;
		return true;
	}

	public previousQueuePage() {
		if (this.queuePage === 0) return false;
		this.queuePage--;
		return true;
	}

	public setLanguage(language: keyof JuanitaMessage) {
		this.lang = language;
	}

	public generateQueuePresentation(): [
		EmbedBuilder,
		ActionRowBuilder,
		ActionRowBuilder | null,
		ActionRowBuilder | null,
	] {
		if (!this.queue) return [new EmbedBuilder(), new ActionRowBuilder(), null, null];
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

		const controlButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel(KYS_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Danger)
				.setCustomId(JSON.stringify({ ffb: 'kys' })),
			new ButtonBuilder()
				.setLabel(SKIP_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Primary)
				.setCustomId(JSON.stringify({ ffb: 'skip' }))
				.setDisabled(this.queue.tracks.length === 0),
			new ButtonBuilder()
				.setLabel(this.queue.connection.paused ? RESUME_BUTTON_LABEL[this.lang] : PAUSE_BUTTON_LABEL[this.lang])
				.setStyle(this.queue.connection.paused ? ButtonStyle.Success : ButtonStyle.Danger)
				.setCustomId(JSON.stringify({ ffb: 'pause&resume' })),
			new ButtonBuilder()
				.setLabel(SHUFFLE_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Secondary)
				.setCustomId(JSON.stringify({ ffb: 'shuffle' }))
				.setDisabled(this.queue.tracks.length === 0),
		);

		if (this.queue.tracks.length === 0) return [embed, controlButtons, null, null];
		const currentPage = this.queuePage;
		const maxPage = Math.ceil(this.queue.tracks.length / 25);
		const queueSelect = new ActionRowBuilder().addComponents(
			getSelectMenuByPage(this.queue.tracks, 1)
				.setPlaceholder(`${QUEUE_SELECT_PLACEHOLDER[this.lang]} ${currentPage}/${maxPage}`)
				.setCustomId('queue_select'),
		);

		const queueButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(JSON.stringify({ ffb: 'previous' }))
				.setLabel(PREVIOUS_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === 1),
			new ButtonBuilder()
				.setCustomId(JSON.stringify({ ffb: 'next' }))
				.setLabel(NEXT_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === maxPage),
		);

		return [embed, queueSelect, controlButtons, queueButtons];
	}
}
