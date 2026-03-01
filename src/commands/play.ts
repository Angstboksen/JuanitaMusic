import { ApplicationCommandOptionType, GuildMember, TextChannel } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { startQueueInterval, sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { getAlias } from "../db/repositories/aliasRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "play",
  description: "Play a song from a search query or URL!",
  voiceChannel: true,
  options: [
    {
      name: "song",
      description: "Song name, URL, or saved alias",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  async execute({ interaction, client, lang }) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member as GuildMember;
    const query = interaction.options.get("song", true).value as string;

    // Resolve alias if it matches
    const alias = await getAlias(interaction.guildId!, query);
    const searchQuery = alias ? alias.playlistId : query;

    const result = await client.kazagumo.search(searchQuery, { requester: member });
    if (!result.tracks.length) {
      await interaction.editReply({
        embeds: [simpleEmbed(`${msg.NO_RESULTS[lang]} \`${query}\``, EmbedType.Error)],
      });
      return;
    }

    let player = client.getPlayer(interaction.guildId!);
    if (!player) {
      player = await client.kazagumo.createPlayer({
        guildId: interaction.guildId!,
        textId: interaction.channelId,
        voiceId: member.voice.channel!.id,
        volume: 50,
      });
    }

    const isPlaylist = result.type === "PLAYLIST";
    if (isPlaylist) {
      player.queue.add(result.tracks);
    } else {
      player.queue.add(result.tracks[0]!);
    }

    if (!player.playing && !player.paused) {
      player.play();
    }

    const state = await getOrCreateGuildState(interaction.guildId!, interaction.guild!.name);
    const channel = interaction.channel as TextChannel;
    startQueueInterval(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());
    sendOrUpdateQueueEmbed(state.queueEmbed, player, lang, channel, client.user?.displayAvatarURL());

    const title = isPlaylist ? result.playlistName : result.tracks[0]!.title;
    const message = isPlaylist ? msg.PLAYLIST_ADDED : msg.TRACK_ADDED;
    await interaction.editReply({
      embeds: [simpleEmbed(`${message[lang]} \`${title}\``, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
