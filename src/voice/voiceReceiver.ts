import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
  type VoiceConnection,
} from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { OpusEncoder } from "@discordjs/opus";

const SAMPLE_RATE = 16000;
const FRAME_SIZE = 480; // 30ms at 16kHz

interface UserAudioStream {
  userId: string;
  pcmChunks: Buffer[];
}

export interface VoiceReceiverEvents {
  userAudio: (userId: string, pcmBuffer: Buffer) => void;
}

export class VoiceReceiverManager extends EventEmitter {
  private connections = new Map<string, VoiceConnection>();
  private encoder: OpusEncoder;

  constructor() {
    super();
    this.encoder = new OpusEncoder(SAMPLE_RATE, 1); // mono
  }

  async join(guild: Guild, channel: VoiceBasedChannel): Promise<VoiceConnection | null> {
    // Don't create duplicate connections
    if (this.connections.has(guild.id)) {
      return this.connections.get(guild.id)!;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

      this.connections.set(guild.id, connection);
      this.setupReceiver(guild.id, connection);

      console.log(`[VoiceReceiver] Connected to ${channel.name} in ${guild.name}`);
      return connection;
    } catch (error) {
      console.error(`[VoiceReceiver] Failed to join:`, error);
      return null;
    }
  }

  private setupReceiver(guildId: string, connection: VoiceConnection): void {
    const receiver = connection.receiver;

    receiver.speaking.on("start", (userId) => {
      // Subscribe to this user's audio
      const audioStream = receiver.subscribe(userId, {
        end: { behavior: 1, duration: 2000 }, // AfterSilence, 2s
      });

      const chunks: Buffer[] = [];

      audioStream.on("data", (chunk: Buffer) => {
        try {
          // Decode Opus to PCM
          const pcm = this.encoder.decode(chunk);
          chunks.push(pcm);
        } catch {
          // Skip malformed packets
        }
      });

      audioStream.on("end", () => {
        if (chunks.length > 0) {
          const fullBuffer = Buffer.concat(chunks);
          this.emit("userAudio", userId, fullBuffer);
        }
      });
    });
  }

  leave(guildId: string): void {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
      console.log(`[VoiceReceiver] Left guild ${guildId}`);
    }
  }

  getConnection(guildId: string): VoiceConnection | undefined {
    return this.connections.get(guildId);
  }
}
