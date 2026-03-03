import type { Guild, GuildMember, TextChannel } from "discord.js";
import type { JuanitaClient } from "../client.js";
import { VoiceReceiverManager } from "./voiceReceiver.js";
import { WakeWordDetector } from "./wakeWordDetector.js";
import { transcribe } from "./speechToText.js";
import { synthesize } from "./textToSpeech.js";
import { TtsPlayer } from "./ttsPlayer.js";
import { config } from "../config.js";
import { getOrCreateGuildState } from "../music/guildState.js";
import { buildVoiceSystemPrompt } from "../llm/systemPrompts.js";
import { chatCompletion } from "../llm/openrouter.js";
import type { ToolContext } from "../llm/tools.js";

export class VoiceCommandHandler {
  private receiver: VoiceReceiverManager;
  private wakeWord: WakeWordDetector;
  private ttsPlayer: TtsPlayer;
  private processing = new Set<string>(); // guildId:userId currently processing

  constructor() {
    this.receiver = new VoiceReceiverManager();
    this.wakeWord = new WakeWordDetector();
    this.ttsPlayer = new TtsPlayer();
  }

  async initialize(): Promise<boolean> {
    if (!config.voice) {
      console.log("[VoiceCmd] Voice config not set, voice assistant disabled");
      return false;
    }
    if (!config.openrouter) {
      console.log("[VoiceCmd] OpenRouter not configured, voice assistant disabled");
      return false;
    }

    const wakeWordReady = await this.wakeWord.initialize();
    if (!wakeWordReady) {
      console.log("[VoiceCmd] Wake word failed to initialize");
      return false;
    }

    // Listen for user audio from the receiver
    this.receiver.on("userAudio", (userId: string, pcmBuffer: Buffer) => {
      this.handleUserAudio(userId, pcmBuffer);
    });

    console.log("[VoiceCmd] Voice assistant initialized");
    return true;
  }

  /**
   * Start listening in a voice channel for a guild.
   * Call this when a Kazagumo player starts and voice is enabled.
   */
  async startListening(
    client: JuanitaClient,
    guild: Guild,
    voiceChannelId: string,
    textChannelId: string,
  ): Promise<void> {
    const channel = guild.channels.cache.get(voiceChannelId);
    if (!channel?.isVoiceBased()) return;

    const connection = await this.receiver.join(guild, channel);
    if (!connection) return;

    // Store context for this guild so handleUserAudio can access it
    this.guildContexts.set(guild.id, {
      client,
      guild,
      textChannelId,
      voiceChannelId,
    });
  }

  stopListening(guildId: string): void {
    this.receiver.leave(guildId);
    this.guildContexts.delete(guildId);
  }

  private guildContexts = new Map<string, {
    client: JuanitaClient;
    guild: Guild;
    textChannelId: string;
    voiceChannelId: string;
  }>();

  private async handleUserAudio(userId: string, pcmBuffer: Buffer): Promise<void> {
    // Find which guild this user is in
    let guildId: string | null = null;
    let ctx: { client: JuanitaClient; guild: Guild; textChannelId: string; voiceChannelId: string } | undefined;

    for (const [id, context] of this.guildContexts) {
      const member = context.guild.members.cache.get(userId);
      if (member?.voice.channelId === context.voiceChannelId) {
        guildId = id;
        ctx = context;
        break;
      }
    }

    if (!guildId || !ctx) return;

    // Debounce: don't process if already handling a command from this user
    const processingKey = `${guildId}:${userId}`;
    if (this.processing.has(processingKey)) return;

    // Check for wake word
    const commandAudio = this.wakeWord.extractCommandAudio(pcmBuffer);
    if (!commandAudio) return; // No wake word detected

    console.log(`[VoiceCmd] Wake word detected from user ${userId} in guild ${guildId}`);
    this.processing.add(processingKey);

    try {
      const state = await getOrCreateGuildState(guildId, ctx.guild.name);

      // Transcribe the command audio
      const transcript = await transcribe(commandAudio, state.lang);
      if (!transcript) {
        console.log("[VoiceCmd] No speech detected after wake word");
        return;
      }

      console.log(`[VoiceCmd] Command: "${transcript}"`);

      // Resolve the guild member
      const member = ctx.guild.members.cache.get(userId)
        ?? await ctx.guild.members.fetch(userId);

      const textChannel = ctx.guild.channels.cache.get(ctx.textChannelId) as TextChannel | undefined;
      if (!textChannel) return;

      // Build tool context for LLM
      const toolContext: ToolContext = {
        client: ctx.client,
        guildId,
        member,
        textChannel,
        lang: state.lang,
      };

      // Send to LLM with voice-mode prompt
      const systemPrompt = buildVoiceSystemPrompt(state.lang);
      const response = await chatCompletion(
        systemPrompt,
        [], // No conversation history for voice commands (each is independent)
        transcript,
        "Sorry, I couldn't process that.",
        toolContext,
      );

      console.log(`[VoiceCmd] Response: "${response}"`);

      // Synthesize TTS response
      const ttsAudio = await synthesize(response, state.lang);
      if (!ttsAudio) return;

      // Play TTS with music ducking
      const connection = this.receiver.getConnection(guildId);
      const musicPlayer = ctx.client.getPlayer(guildId);
      if (connection) {
        await this.ttsPlayer.speak(connection, ttsAudio, musicPlayer);
      }
    } catch (error) {
      console.error("[VoiceCmd] Error handling voice command:", error);
    } finally {
      this.processing.delete(processingKey);
    }
  }

  destroy(): void {
    this.wakeWord.destroy();
    for (const guildId of this.guildContexts.keys()) {
      this.receiver.leave(guildId);
    }
    this.guildContexts.clear();
  }
}
