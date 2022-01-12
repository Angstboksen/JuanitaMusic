import {
  Client,
  CommandInteraction,
  ContextMenuInteraction,
  Guild,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextBasedChannels,
} from "discord.js";
import { Pagination, PaginationResolver } from "@discordx/pagination";
import { Player, Queue } from "@discordx/music";

export default class JuanitaQueue extends Queue {
  lastControlMessage?: Message;
  timeoutTimer?: NodeJS.Timeout;
  lockUpdate = false;

  get playbackMilliseconds(): number {
    const track = this.currentTrack;
    if (
      !track ||
      !track.metadata.isYoutubeTrack() ||
      !track.metadata.info.duration
    ) {
      return 0;
    }

    return this.toMS(track.metadata.info.duration);
  }

  constructor(
    player: Player,
    guild: Guild,
    public channel?: TextBasedChannels
  ) {
    super(player, guild);
    setInterval(() => this.updateControlMessage(), 1e4);
    // empty constructor
  }

  public fromMS(duration: number): string {
    const seconds = Math.floor((duration / 1e3) % 60);
    const minutes = Math.floor((duration / 6e4) % 60);
    const hours = Math.floor(duration / 36e5);
    const secondsPad = `${seconds}`.padStart(2, "0");
    const minutesPad = `${minutes}`.padStart(2, "0");
    const hoursPad = `${hours}`.padStart(2, "0");
    return `${hours ? `${hoursPad}:` : ""}${minutesPad}:${secondsPad}`;
  }

  public toMS(duration: string): number {
    const milliseconds =
      duration
        .split(":")
        .reduceRight(
          (prev, curr, i, arr) =>
            prev + parseInt(curr) * Math.pow(60, arr.length - 1 - i),
          0
        ) * 1e3;

    return milliseconds ? milliseconds : 0;
  }

  private controlsRow(): MessageActionRow[] {
    const nextButton = new MessageButton()
      .setLabel("Next")
      .setEmoji("⏭")
      .setStyle("PRIMARY")
      .setDisabled(!this.isPlaying)
      .setCustomId("btn-next");

    const pauseButton = new MessageButton()
      .setLabel(this.isPlaying ? "Pause" : "Resume")
      .setEmoji(this.isPlaying ? "⏸️" : "▶️")
      .setStyle("PRIMARY")
      .setCustomId("btn-pause");

    const stopButton = new MessageButton()
      .setLabel("Kys")
      .setEmoji("💀")
      .setStyle("DANGER")
      .setCustomId("btn-leave");

    const repeatButton = new MessageButton()
      .setLabel("Repeat")
      .setEmoji("🔂")
      .setDisabled(!this.isPlaying)
      .setStyle(this.repeat ? "DANGER" : "PRIMARY")
      .setCustomId("btn-repeat");

    const loopButton = new MessageButton()
      .setLabel("Loop")
      .setEmoji("🔁")
      .setDisabled(!this.isPlaying)
      .setStyle(this.loop ? "DANGER" : "PRIMARY")
      .setCustomId("btn-loop");

    const row1 = new MessageActionRow().addComponents(
      stopButton,
      pauseButton,
      nextButton,
      repeatButton,
      loopButton
    );

    const queueButton = new MessageButton()
      .setLabel("Queue")
      .setEmoji("🎵")
      .setStyle("PRIMARY")
      .setCustomId("btn-queue");

    /*const mixButton = new MessageButton()
      .setLabel("Shuffle")
      .setEmoji("🎛️")
      .setDisabled(!this.isPlaying)
      .setStyle("PRIMARY")
      .setCustomId("btn-mix");
      */

    const controlsButton = new MessageButton()
      .setLabel("Controls")
      .setEmoji("🔄")
      .setStyle("PRIMARY")
      .setCustomId("btn-controls");

    const row2 = new MessageActionRow().addComponents(
      queueButton,
      /*mixButton,*/
      controlsButton
    );
    return [row1, row2];
  }

  public async updateControlMessage(options?: {
    force?: boolean;
    text?: string;
  }): Promise<void> {
    if (this.lockUpdate) {
      return;
    }
    this.lockUpdate = true;
    const embed = new MessageEmbed();
    embed.setTitle("Bruk knappene for å kontrollere musikken");
    const currentTrack = this.currentTrack;
    const nextTrack = this.nextTrack;
    if (!currentTrack) {
      if (this.lastControlMessage) {
        await this.lastControlMessage.delete();
        this.lastControlMessage = undefined;
      }
      this.lockUpdate = false;
      return;
    }
    const user = currentTrack.metadata.isYoutubeTrack()
      ? currentTrack.metadata.options?.user
      : currentTrack.metadata?.user;

    embed.addField(
      "Nå spiller:",
      `[${currentTrack.metadata.title}](${currentTrack.metadata.url ?? "NaN"})${
        user ? ` lagt til av ${user}` : ""
      }`
    );

    const progressBaroptions = {
      size: 15,
      arrow: "🔘",
      block: "━",
    };

    if (currentTrack.metadata.isYoutubeTrack()) {
      const { size, arrow, block } = progressBaroptions;
      const timeNow = this.playbackDuration;
      const timeTotal = this.playbackMilliseconds;

      const progress = Math.round((size * timeNow) / timeTotal);
      const emptyProgress = size - progress;

      const progressString =
        block.repeat(progress) + arrow + block.repeat(emptyProgress);

      const bar = (this.isPlaying ? "▶️" : "⏸️") + " " + progressString;
      const currentTime = this.fromMS(timeNow);
      const endTime = this.fromMS(timeTotal);
      const spacing = bar.length - currentTime.length - endTime.length;
      const time =
        "`" + currentTime + " ".repeat(spacing * 3 - 2) + endTime + "`";

      embed.addField(bar, time);
      embed.addField("Antall sanger i køen:", "" + this.size);
    }

    if (
      currentTrack.metadata.isYoutubeTrack() &&
      currentTrack.metadata.info.bestThumbnail.url
    ) {
      embed.setThumbnail(currentTrack.metadata.info.bestThumbnail.url);
    }

    embed.addField(
      "Neste sang i køen:",
      nextTrack
        ? `[${nextTrack.title}](${nextTrack.url})`
        : "Ingen sanger ligger i køen"
    );

    const pMsg = {
      content: options?.text,
      embeds: [embed],
      components: [...this.controlsRow()],
    };

    if (!this.isReady && this.lastControlMessage) {
      await this.lastControlMessage.delete();
      this.lastControlMessage = undefined;
      this.lockUpdate = false;
      return;
    }

    try {
      if (!this.lastControlMessage || options?.force) {
        if (this.lastControlMessage) {
          await this.lastControlMessage.delete();
          this.lastControlMessage = undefined;
        }
        this.lastControlMessage = await this.channel?.send(pMsg);
      } else {
        await this.lastControlMessage.edit(pMsg);
      }
    } catch (err) {
      // ignore
      console.log(err);
    }

    this.lockUpdate = false;
  }

  public async view(
    interaction: Message | CommandInteraction | ContextMenuInteraction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client: Client
  ): Promise<void> {
    const currentTrack = this.currentTrack;
    if (!this.isReady || !currentTrack) {
      const pMsg = await interaction.reply({
        content: "Kunne ikke prosessere dette nå :x:",
        ephemeral: true,
      });
      if (pMsg instanceof Message) {
        setTimeout(() => pMsg.delete(), 3000);
      }
      return;
    }

    if (!this.size) {
      const pMsg = await interaction.reply(
        `Spilles nå: **${currentTrack.metadata.title}**`
      );
      if (pMsg instanceof Message) {
        setTimeout(() => pMsg.delete(), 1e4);
      }
      return;
    }

    const pageOptions = new PaginationResolver((index, paginator) => {
      paginator.maxLength = this.size / 10;
      if (index > paginator.maxLength) {
        paginator.currentPage = 0;
      }

      const currentPage = paginator.currentPage;

      const queue = this.tracks
        .slice(currentPage * 10, currentPage * 10 + 10)
        .map(
          (track, sindex) =>
            `${currentPage * 10 + sindex + 1}. ${track.title}` +
            `${
              track.isYoutubeTrack() && track.info.duration
                ? ` (${track.info.duration})`
                : ""
            }`
        )
        .join("\n\n");

      return `\`\`\`markdown\n${queue}\`\`\``;
    }, Math.round(this.size / 10));

    await new Pagination(interaction, pageOptions, {
      enableExit: true,
      onTimeout: (index, message) => {
        if (message.deletable) {
          message.delete();
        }
      },
      type: Math.round(this.size / 10) <= 5 ? "BUTTON" : "SELECT_MENU",
      time: 6e4,
    }).send();
  }
}
