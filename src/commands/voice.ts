import { simpleEmbed, EmbedType } from "../embeds/simpleEmbed.js";
import { guildStates } from "../music/guildState.js";
import { toggleVoice } from "../db/repositories/guildRepo.js";
import type { JuanitaCommand } from "./types.js";

export default {
  name: "voice",
  description: "Toggle voice assistant (say 'Juanita' to control music by voice)",
  voiceChannel: false,

  async execute({ interaction, client, lang }) {
    const guildId = interaction.guildId!;
    const newValue = await toggleVoice(guildId);

    const state = guildStates.get(guildId);
    if (state) state.voiceEnabled = newValue;

    if (newValue) {
      // If bot is in a voice channel, start listening immediately
      const player = client.getPlayer(guildId);
      if (player && client.voiceHandler) {
        const guild = interaction.guild!;
        await client.voiceHandler.startListening(
          client,
          guild,
          player.voiceChannelId,
          interaction.channelId,
        );
      }

      await interaction.reply({
        embeds: [simpleEmbed(
          lang === "molde"
            ? "STEMMEASSISTENTEN E PÅ! SI 'JUANITA' FOR Å GI MEG KOMMANDOA!"
            : lang === "no"
              ? "Stemmeassistent aktivert! Si 'Juanita' for å gi meg kommandoer."
              : "Voice assistant enabled! Say 'Juanita' to give me commands.",
          EmbedType.Success,
        )],
      });
    } else {
      // Stop listening
      client.voiceHandler?.stopListening(guildId);

      await interaction.reply({
        embeds: [simpleEmbed(
          lang === "molde"
            ? "STEMMEASSISTENTEN E AV."
            : lang === "no"
              ? "Stemmeassistent deaktivert."
              : "Voice assistant disabled.",
          EmbedType.Success,
        )],
      });
    }
  },
} as JuanitaCommand;
