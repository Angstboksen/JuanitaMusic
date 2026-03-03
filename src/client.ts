import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { JuanitaCommand } from "./commands/types.js";
import { PlayerManager } from "./music/playerManager.js";
import type { MusicPlayer } from "./music/player.js";
import { VoiceCommandHandler } from "./voice/voiceCommandHandler.js";

export class JuanitaClient extends Client {
  public playerManager: PlayerManager;
  public commands: Collection<string, JuanitaCommand> = new Collection();
  public voiceHandler: VoiceCommandHandler | null = null;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.playerManager = new PlayerManager();
  }

  public getPlayer(guildId: string): MusicPlayer | undefined {
    return this.playerManager.get(guildId);
  }
}
