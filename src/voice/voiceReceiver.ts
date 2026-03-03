import {
  type VoiceConnection,
} from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import opus from "@discordjs/opus";
const { OpusEncoder } = opus;

const SAMPLE_RATE = 16000;
const MAX_RECORD_MS = 5000; // Hard cap — never record longer than this
const SILENCE_MS = 500; // End early after 500ms of silence

export class VoiceReceiverManager extends EventEmitter {
  private connections = new Map<string, VoiceConnection>();
  private activeSubscriptions = new Set<string>();

  /**
   * Attach to an existing VoiceConnection (owned by MusicPlayer).
   */
  join(guild: Guild, channel: VoiceBasedChannel, connection: VoiceConnection): VoiceConnection {
    // Don't create duplicate subscriptions
    if (this.connections.has(guild.id)) {
      return this.connections.get(guild.id)!;
    }

    this.connections.set(guild.id, connection);
    this.setupReceiver(guild.id, connection);

    console.log(`[VoiceReceiver] Attached to ${channel.name} in ${guild.name}`);
    return connection;
  }

  private setupReceiver(guildId: string, connection: VoiceConnection): void {
    const receiver = connection.receiver;

    receiver.speaking.on("start", (userId) => {
      const subscriptionKey = `${guildId}:${userId}`;
      if (this.activeSubscriptions.has(subscriptionKey)) return;
      this.activeSubscriptions.add(subscriptionKey);

      // Per-user encoder to avoid corrupting PCM for concurrent users
      const encoder = new OpusEncoder(SAMPLE_RATE, 1); // mono

      // Subscribe to this user's audio
      // AfterSilence ends the stream after short silence, but we also
      // enforce a hard cap so it never records longer than MAX_RECORD_MS
      const audioStream = receiver.subscribe(userId, {
        end: { behavior: 1, duration: SILENCE_MS }, // AfterSilence
      });

      const chunks: Buffer[] = [];
      let emitted = false;

      const emitAudio = () => {
        if (emitted) return;
        emitted = true;
        clearTimeout(hardTimeout);
        audioStream.destroy();
        this.activeSubscriptions.delete(subscriptionKey);
        if (chunks.length > 0) {
          const fullBuffer = Buffer.concat(chunks);
          this.emit("userAudio", guildId, userId, fullBuffer);
        }
      };

      // Hard cap: force-end after MAX_RECORD_MS regardless of speaking
      const hardTimeout = setTimeout(emitAudio, MAX_RECORD_MS);

      audioStream.on("data", (chunk: Buffer) => {
        try {
          // Decode Opus to PCM
          const pcm = encoder.decode(chunk);
          chunks.push(pcm);
        } catch {
          // Skip malformed packets
        }
      });

      audioStream.on("end", emitAudio);
    });
  }

  leave(guildId: string): void {
    if (this.connections.has(guildId)) {
      // Don't destroy — MusicPlayer owns the connection. Just stop tracking.
      this.connections.delete(guildId);
      console.log(`[VoiceReceiver] Detached from guild ${guildId}`);
    }
  }

  getConnection(guildId: string): VoiceConnection | undefined {
    return this.connections.get(guildId);
  }
}
