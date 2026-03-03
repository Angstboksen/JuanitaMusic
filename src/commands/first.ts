import { ApplicationCommandOptionType, GuildMember, TextChannel } from "discord.js";
import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import * as msg from "../i18n/messages.js";
import { startQueueInterval, sendOrUpdateQueueEmbed } from "../embeds/queueEmbed.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { getAlias } from "../db/repositories/aliasRepo.js";
import { searchTracks } from "../music/search.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "first",
  description: "Add a song to the front of the queue!",
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

    const result = await searchTracks(searchQuery, member);
    if (!result.tracks.length) {
      await interaction.editReply({
        embeds: [simpleEmbed(`${msg.NO_RESULTS[lang]} \`${query}\``, EmbedType.Error)],
      });
      return;
    }

    let player = client.getPlayer(interaction.guildId!);
    if (!player) {
      player = client.playerManager.create({
        guildId: interaction.guildId!,
        textChannelId: interaction.channelId,
        voiceChannelId: member.voice.channel!.id,
        adapterCreator: interaction.guild!.voiceAdapterCreator,
        volume: 50,
      });
    }

    const isPlaylist = result.type === "PLAYLIST";
    const tracksToAdd = isPlaylist ? result.tracks : [result.tracks[0]!];

    // Insert at the front of the queue using splice
    const currentQueue = [...player.queue];
    player.queue.clear();
    player.queue.add(tracksToAdd);
    if (currentQueue.length > 0) {
      player.queue.add(currentQueue);
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
      embeds: [simpleEmbed(`${message[lang]} \`${title}\` (first in queue)`, EmbedType.Success)],
    });
  },
} as JuanitaCommand;
