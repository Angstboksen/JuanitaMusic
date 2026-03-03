import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Kazagumo, KazagumoPlayer } from "kazagumo";
import { Connectors } from "shoukaku";
import { config } from "./config.js";
import type { JuanitaCommand } from "./commands/types.js";
import { VoiceCommandHandler } from "./voice/voiceCommandHandler.js";

export class JuanitaClient extends Client {
  public kazagumo: Kazagumo;
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

    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this),
      [
        {
          name: "main",
          url: `${config.lavalink.host}:${config.lavalink.port}`,
          auth: config.lavalink.password,
          secure: false,
        },
      ],
    );
  }

  public getPlayer(guildId: string): KazagumoPlayer | undefined {
    return this.kazagumo.getPlayer(guildId);
  }
}
