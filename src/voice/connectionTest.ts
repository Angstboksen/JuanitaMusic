import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";

/**
 * Temporary spike: attempt to create a @discordjs/voice connection
 * alongside an existing Shoukaku/Lavalink connection.
 *
 * Call this after Kazagumo player starts to test coexistence.
 */
export async function testVoiceReceiver(
  guild: Guild,
  channel: VoiceBasedChannel,
): Promise<boolean> {
  try {
    console.log(`[VoiceSpike] Attempting to join ${channel.name} via @discordjs/voice...`);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,  // MUST be false to receive audio
      selfMute: true,   // We don't send audio through this connection
    });

    // Wait for connection to be ready (max 5 seconds)
    await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
    console.log("[VoiceSpike] @discordjs/voice connection established!");

    // Test receiving audio
    const receiver = connection.receiver;
    receiver.speaking.on("start", (userId) => {
      console.log(`[VoiceSpike] User ${userId} started speaking`);

      const audioStream = receiver.subscribe(userId, {
        end: { behavior: 1, duration: 5000 }, // EndBehaviorType.AfterSilence
      });

      let chunks = 0;
      audioStream.on("data", () => { chunks++; });
      audioStream.on("end", () => {
        console.log(`[VoiceSpike] Received ${chunks} audio chunks from user ${userId}`);
      });
    });

    console.log("[VoiceSpike] Listening for voice activity... (speak in the channel to test)");
    return true;
  } catch (error) {
    console.error("[VoiceSpike] Failed:", error);
    return false;
  }
}
