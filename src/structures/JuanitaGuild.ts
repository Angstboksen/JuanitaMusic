import type { Queue, Track } from 'discord-player';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Guild,
	Message,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	TextChannel,
} from 'discord.js';
import {
	JuanitaMessage,
	KYS_BUTTON_LABEL,
	NEXT_BUTTON_LABEL,
	PAUSE_BUTTON_LABEL,
	PREVIOUS_BUTTON_LABEL,
	QUEUE_ADDED_BY,
	QUEUE_AUTHOR_NAME,
	QUEUE_NEXT_SONG,
	QUEUE_NOW_PLAYING,
	QUEUE_NO_SONGS,
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
	public queuePage: number = 0;
	public lang: keyof JuanitaMessage = 'no';
	
	constructor(public client: JuanitaClient, public guild: Guild) {
		this.id = guild.id;
		this.guild = guild;
	}

	public async updateQueueMessage(textChannel?: TextChannel) {
		if (!this.queue || (!this.queue.current && !this.queue.tracks.length)) {
			this.removeQueueMessage();
			this.stopInterval();
			return;
		}
		if (!this.queueMessage && textChannel) return await this.sendQueueMessage(textChannel);
		const [embed, buttons, queueSelect, queueButtons] = this.generateQueuePresentation();
		if (queueSelect && queueButtons)
			return await this.queueMessage?.edit({
				embeds: [embed],
				components: [buttons, queueSelect, queueButtons],
			});
		return await this.queueMessage?.edit({ embeds: [embed], components: [buttons] });
	}

	public async sendQueueMessage(channel: TextChannel): Promise<Message | undefined> {
		if (!channel) return;
		if (this.queueMessage) return this.updateQueueMessage();
		const [embed, buttons, queueSelect, queueButtons] = this.generateQueuePresentation();
		if (queueSelect && queueButtons)
			return (this.queueMessage = await channel.send({
				embeds: [embed],
				components: [buttons, queueSelect, queueButtons],
			}));
		return (this.queueMessage = await channel.send({ embeds: [embed] }));
	}

	public async removeQueueMessage() {
		if (this.queueMessage) {
			try {
				await this.queueMessage.delete();
			} catch {
				// Ignore
			}
		}
		this.queueMessage = null;
	}

	public startInterval(channel: TextChannel) {
		this.stopInterval();
		this.interval = setInterval(() => {
			this.updateQueueMessage(channel);
		}, 2500);
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

	public validateSelectMenuValue(value: number): boolean {
		return value >= 0 && value < this.queue!.tracks.length;
	}

	public generateQueuePresentation(): [
		EmbedBuilder,
		ActionRowBuilder<ButtonBuilder>,
		ActionRowBuilder<SelectMenuBuilder> | null,
		ActionRowBuilder<ButtonBuilder> | null,
	] {
		if (!this.queue) return [new EmbedBuilder(), new ActionRowBuilder(), null, null];
		const currentString = `${QUEUE_NOW_PLAYING[this.lang]} [${this.queue.current.title}](${
			this.queue.current.url
		})\n${`${QUEUE_ADDED_BY[this.lang]} ${this.queue.current.requestedBy}`}\n`;
		const currentTime =
			timeToMilliseconds(this.queue.getPlayerTimestamp().end) -
			timeToMilliseconds(this.queue.getPlayerTimestamp().current);
		const queueTime = this.queue.tracks.reduce((acc: number, track: Track) => acc + track.durationMS, 0);
		// link to song url with title shown
		const nextSongString =
			this.queue.tracks.length > 0
				? `[${this.queue.tracks[0]!.title}](${this.queue.tracks[0]!.url})`
				: QUEUE_NO_SONGS[this.lang];

		const embed = SimpleEmbed(`${currentString}\n${this.queue.createProgressBar()}\n\n`, EmbedType.Info)
			.setThumbnail(this.queue.current.thumbnail)
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
				{ name: QUEUE_NEXT_SONG[this.lang], value: nextSongString, inline: false },
			);

		const controlButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
				.setStyle(ButtonStyle.Primary)
				.setCustomId(JSON.stringify({ ffb: 'shuffle' }))
				.setDisabled(this.queue.tracks.length === 0),
		);

		if (this.queue.tracks.length === 0) return [embed, controlButtons, null, null];
		const currentPage = this.queuePage;
		const maxPage = Math.ceil(this.queue.tracks.length / 25);
		const queueSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			getSelectMenuByPage(this.queue.tracks, currentPage)
				.setPlaceholder(
					`${QUEUE_SELECT_PLACEHOLDER[this.lang]} ${currentPage * 25 + 1}/${Math.min(
						(currentPage + 1) * 25,
						this.queue.tracks.length,
					)}`,
				)
				.setCustomId('queue_select'),
		);

		const queueButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(JSON.stringify({ ffb: 'previous' }))
				.setLabel(PREVIOUS_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === 0),
			new ButtonBuilder()
				.setCustomId(JSON.stringify({ ffb: 'next' }))
				.setLabel(NEXT_BUTTON_LABEL[this.lang])
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === maxPage - 1),
		);

		return [embed, controlButtons, queueSelect, queueButtons];
	}
}
