import {
  ArgsOf,
  ButtonComponent,
  Client,
  Discord,
  On,
  Slash,
  SlashOption,
} from "discordx";
import {
  CommandInteraction,
  Guild,
  GuildMember,
  MessageEmbed,
} from "discord.js";
import { JuanitaPlayer, JuanitaQueue, SpotifySearcher } from "./core";
import { mongoExistsAlias, mongoStoreAlias, mongoRetrieveAliases } from "./api/mongo";

@Discord()
export class Music {
  player;

  constructor() {
    this.player = new JuanitaPlayer();
  }

  @On("voiceStateUpdate")
  voiceUpdate(
    [oldState, newState]: ArgsOf<"voiceStateUpdate">,
    client: Client
  ): void {
    const queue = this.player.getQueue(oldState.guild);

    if (
      !queue.isReady ||
      !queue.voiceChannelId ||
      (oldState.channelId != queue.voiceChannelId &&
        newState.channelId != queue.voiceChannelId) ||
      !queue.channel
    ) {
      return;
    }

    const channel =
      oldState.channelId === queue.voiceChannelId
        ? oldState.channel
        : newState.channel;

    if (!channel) {
      return;
    }

    const totalMembers = channel.members.filter((m) => !m.user.bot);

    if (queue.isPlaying && !totalMembers.size) {
      queue.pause();
      queue.channel.send({
        embeds: [
          createInfoEmbed(
            "Ait lads :sweat_smile: Siden ingen er her, så pauser jeg meg :kissing_heart:"
          ),
        ],
      });

      if (queue.timeoutTimer) {
        clearTimeout(queue.timeoutTimer);
      }

      queue.timeoutTimer = setTimeout(() => {
        queue.channel?.send({
          embeds: [
            createInfoEmbed(
              "Ait lads :sweat_smile: Siden ingen joiner, så sletter jeg køen :scissors:"
            ),
          ],
        });
        queue.leave();
      }, 5 * 60 * 1000);
    } else if (queue.isPause && totalMembers.size) {
      if (queue.timeoutTimer) {
        clearTimeout(queue.timeoutTimer);
        queue.timeoutTimer = undefined;
      }
      queue.resume();
      queue.channel.send({
        embeds: [createInfoEmbed("Se der ja :kissing_hear: Enjoy :notes:")],
      });
    }
  }

  validateControlInteraction(
    interaction: CommandInteraction,
    client: Client
  ): JuanitaQueue | undefined {
    if (
      !interaction.guild ||
      !interaction.channel ||
      !(interaction.member instanceof GuildMember)
    ) {
      interaction.reply({
        embeds: [
          createInfoEmbed("Her skjedde det en feil :grimacing: Sawwy! :heart:"),
        ],
      });
      return;
    }

    const queue = this.player.getQueue(interaction.guild, interaction.channel);

    if (interaction.member.voice.channelId !== queue.voiceChannelId) {
      interaction.reply({
        embeds: [
          createInfoEmbed(
            "Du må joine kanalen for å kunne bruke kontrollene ladden! :japanese_goblin:"
          ),
        ],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    return queue;
  }

  @ButtonComponent("btn-next")
  async nextControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.skip();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent("btn-pause")
  async pauseControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.isPause ? queue.resume() : queue.pause();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent("btn-leave")
  async leaveControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.leave();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent("btn-repeat")
  async repeatControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.setRepeat(!queue.repeat);
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent("btn-queue")
  queueControl(interaction: CommandInteraction, client: Client): void {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.view(interaction, client);
  }

  @ButtonComponent("btn-mix")
  async mixControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.mix();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent("btn-controls")
  async controlsControl(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = this.validateControlInteraction(interaction, client);
    if (!queue) {
      return;
    }
    queue.updateControlMessage({ force: true });
    await interaction.deferReply();
    interaction.deleteReply();
  }

  async processJoin(
    interaction: CommandInteraction,
    client: Client
  ): Promise<JuanitaQueue | undefined> {
    if (
      !interaction.guild ||
      !interaction.channel ||
      !(interaction.member instanceof GuildMember)
    ) {
      interaction.reply({
        embeds: [
          createInfoEmbed("Kunne ikke prosessere det boio, sorry! :poop:"),
        ],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.member.voice.channel
    ) {
      interaction.reply({
        embeds: [createInfoEmbed("Join kanalen din klovn :clown:")],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    await interaction.deferReply();
    const queue = this.player.getQueue(interaction.guild, interaction.channel);

    if (!queue.isReady) {
      queue.channel = interaction.channel;
      await queue.join(interaction.member.voice.channel);
    }

    return queue;
  }

  @Slash("play", { description: "Søk og spill av en sang" })
  async play(
    @SlashOption("sangnavn", { description: "Søkestreng for sangen" })
    songName: string,
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = await this.processJoin(interaction, client);
    if (!queue) {
      return;
    }
    const song = await queue.play(songName, { user: interaction.user });
    if (!song) {
      interaction.followUp({
        embeds: [
          createInfoEmbed("Fant ikke sangen du lette etter :grimacing:"),
        ],
      });
    } else {
      interaction.followUp({
        embeds: [createInfoEmbed(`La til \`${song.title}\` i køen :notes:`)],
      });
    }
  }

  @Slash("spotify", { description: "Spill av en spilleliste fra spotify" })
  async spotify(
    @SlashOption("spilleliste", {
      description: "Lagret alias eller id for spilleliste",
    })
    link: string,
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = await this.processJoin(interaction, client);
    if (!queue) {
      return;
    }
    const remembered = await mongoExistsAlias(link);
    const validPlaylist = await SpotifySearcher.searchPlaylist(
      remembered ? remembered.plid : link
    );

    const songs = await queue.spotify(validPlaylist ? validPlaylist : link, {
      user: interaction.user,
    });
    if (!songs) {
      interaction.followUp({
        embeds: [createInfoEmbed("Fant ikke spillelisten du lette etter :x:")],
      });
    } else {
      interaction.followUp({
        embeds: [
          createInfoEmbed(
            `La til \`${songs.length}\` sanger fra \`${link}\` :notes:**`
          ),
        ],
      });
    }
  }

  validateInteraction(
    interaction: CommandInteraction,
    client: Client
  ): undefined | { guild: Guild; member: GuildMember; queue: JuanitaQueue } {
    if (
      !interaction.guild ||
      !(interaction.member instanceof GuildMember) ||
      !interaction.channel
    ) {
      interaction.reply({
        embeds: [
          createInfoEmbed("Her skjedde det en feil :grimacing: Sawwy! :heart:"),
        ],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    if (!interaction.member.voice.channel) {
      interaction.reply({
        embeds: [
          createInfoEmbed(
            "Du må joine kanalen for å kunne bruke kontrollene ladden! :japanese_goblin:"
          ),
        ],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    const queue = this.player.getQueue(interaction.guild, interaction.channel);

    if (
      !queue.isReady ||
      interaction.member.voice.channel.id !== queue.voiceChannelId
    ) {
      interaction.reply({
        embeds: [
          createInfoEmbed(
            "Du må joine kanalen for å kunne bruke kontrollene ladden! :japanese_goblin:"
          ),
        ],
      });

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    return { guild: interaction.guild, member: interaction.member, queue };
  }

  @Slash("skip", { description: "Skip sangen som spilles" })
  skip(interaction: CommandInteraction, client: Client): void {
    const validate = this.validateInteraction(interaction, client);
    if (!validate) {
      return;
    }

    const { queue } = validate;

    queue.skip();
    interaction.reply({
      embeds: [
        createInfoEmbed("Skippetipangen bort med den sangen :arrow_right:"),
      ],
    });
  }

  @Slash("pause", { description: "Pause sangen som spilles" })
  pause(interaction: CommandInteraction, client: Client): void {
    const validate = this.validateInteraction(interaction, client);
    if (!validate) {
      return;
    }

    const { queue } = validate;

    if (queue.isPause) {
      interaction.reply({
        embeds: [createInfoEmbed("Sangen er allerede på pause :metal:")],
      });
      return;
    }

    queue.pause();
    interaction.reply({
      embeds: [createInfoEmbed("Ait, sangen er nå på pause :pause_button:")],
    });
  }

  @Slash("resume", { description: "Fortsett avspillingen av sangen" })
  resume(interaction: CommandInteraction, client: Client): void {
    const validate = this.validateInteraction(interaction, client);
    if (!validate) {
      return;
    }

    const { queue } = validate;

    if (queue.isPlaying) {
      interaction.reply({
        embeds: [createInfoEmbed("Sangen spiller allerede :metal:")],
      });
      return;
    }

    queue.resume();
    interaction.reply({
      embeds: [createInfoEmbed("Ait, fortsetter avspillingen :arrow_forward:")],
    });
  }

  @Slash("seek", { description: "Spol frem til et tidspunkt i sangen" })
  seek(
    @SlashOption("time", {
      description: "Tid i sekunder",
    })
    time: number,
    interaction: CommandInteraction,
    client: Client
  ): void {
    const validate = this.validateInteraction(interaction, client);
    if (!validate) {
      return;
    }

    const { queue } = validate;

    if (!queue.isPlaying || !queue.currentTrack) {
      interaction.reply({
        embeds: [createInfoEmbed("Ingen sang avspilles nå :no_entry:")],
      });
      return;
    }

    const state = queue.seek(time * 1000);
    if (!state) {
      interaction.reply({
        embeds: [
          createInfoEmbed(
            "Det skjedde en feil ved spolinga di, bruh :interrobang:"
          ),
        ],
      });
      return;
    }
    interaction.reply({
      embeds: [createInfoEmbed("Ait, kos deg boio :heart_exclamation:")],
    });
  }

  @Slash("kys", { description: "Forlat kanalen og resetter køen" })
  kys(interaction: CommandInteraction, client: Client): void {
    const validate = this.validateInteraction(interaction, client);
    if (!validate) {
      return;
    }

    const { queue } = validate;
    queue.leave();
    interaction.reply({
      embeds: [createInfoEmbed("Ait, chattes på jobben a :relaxed:")],
    });
  }

  @Slash("lists", { description: "Lister opp alle lagrede spotifylister" })
  async lists(interaction: CommandInteraction, client: Client): Promise<void> {
    const aliases = await mongoRetrieveAliases();
    if (aliases) interaction.reply({ embeds: [aliasEmbed(aliases)] });
    else interaction.reply({ embeds: [createInfoEmbed("Det skjedde en feil med henting av aliasene :")] });
  }

  @Slash("first", { description: "Sniker inn en sang først i køen" })
  async first(
    @SlashOption("sangnavn", { description: "Søkestreng for sangen" })
    songName: string,
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const queue = await this.processJoin(interaction, client);
    if (!queue) {
      return;
    }
    const song = await queue.play(
      songName,
      { user: interaction.user },
      false,
      true
    );
    if (!song) {
      interaction.followUp({
        embeds: [
          createInfoEmbed("Fant ikke sangen du lette etter :grimacing:"),
        ],
      });
    } else {
      interaction.followUp({
        embeds: [
          createInfoEmbed(`La til **${song.title}** __først__ i køen :notes:`),
        ],
      });
    }
  }

  @Slash("remember", {
    description: "Lagrere en spotify spilleliste med gjeldende alias",
  })
  async remember(
    @SlashOption("spillelisteid", {
      description: "Gjeldende ID for spilleliste",
    })
    playlistid: string,
    @SlashOption("alias", { description: "Alias for spilleliste" })
    alias: string,
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    if (!playlistid || !alias || alias.length < 3 || Number.isInteger(alias)) {
      return interaction.reply({
        embeds: [
          createInfoEmbed("Dette er ikke riktig format på denne kommandoen :x:"),
        ],
      });
    }
    const playlistExists = await SpotifySearcher.findPlaylist(playlistid);

    if (playlistExists.statusCode !== 200)
      return interaction.reply({
        embeds: [
          createInfoEmbed(
            `Spillelisten med id \`${playlistid}\` eksisterer ikke :x:`
          ),
        ],
      });

    const validated = await mongoExistsAlias(alias);
    if (validated)
      return interaction.reply({
        embeds: [
          createInfoEmbed(
            `Aliaset \`${alias}\` er allerede i bruk for spilleliste \`${validated.name}\` :x:`
          ),
        ],
      });

    await mongoStoreAlias(playlistid, alias, playlistExists.name);
    interaction.reply({
      embeds: [
        createInfoEmbed(`:white_check_mark: Jeg husker nå \`${playlistid}\` som \`${alias}\`\n
        :watermelon: Du kan nå bruke kommando \`!spotify ${alias}\` for å spille av listen`),
      ],
    });
  }
}

const aliasEmbed = (
  aliases: { alias: string; plid: string; name: string }[]
) => {
  if (aliases.length === 0)
    return createInfoEmbed(
      ":watermelon: Bruk `!remember <id> <alias>` for å legge til"
    ).setTitle(":scream_cat: Ingen aliaser er lagret");
  let desc = "";
  for (let i = 0; i < aliases.length; i++) {
    desc += `:cyclone: **Navn**: [${aliases[i].name}](https://open.spotify.com/playlist/${aliases[i].plid}) | :spy: **Alias:** \`${aliases[i].alias}\`  \n\n`;
  }
  desc += `\n:watermelon: Bruk \`/spotify <alias>\` for å spille av lista \n\n :mag: Det er lagret totalt \`${aliases.length}\` aliaser`;
  return createInfoEmbed(desc).setTitle(
    ":arrow_down: Her er alle aliasene som er lagret"
  );
};

export const createEmbed = () => {
  return new MessageEmbed().setColor("RANDOM");
};

export const createInfoEmbed = (message: string = "") => {
  return createEmbed().setDescription(message);
};
