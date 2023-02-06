import { Player } from 'discord-player';
import type { JuanitaConfig } from '../config';
import { Client, ClientOptions, Collection, Guild } from 'discord.js';
import loadClient from './loader';
import JuanitaGuildCommander from './structures/JuanitaGuildCommander';
import JuanitaGuild from './structures/JuanitaGuild';
import { setGuildIfNotExists } from './service/guildService';
import type { JuanitaMessage } from './embeds/messages';

type JuanitaClientOptions = ClientOptions;

export default class JuanitaClient extends Client {
	public player: Player;
	public config: JuanitaConfig;
	public commands: Collection<any, any> = new Collection();
	public guildCommander: JuanitaGuildCommander = new JuanitaGuildCommander();

	constructor(options: JuanitaClientOptions, config: JuanitaConfig) {
		super(options);
		this.player = new Player(this, config.opt.discordPlayer);
		this.config = config;
		loadClient(this);
	}

	public getJuanitaGuild(guildId: string): JuanitaGuild {
		return this.guildCommander.get(guildId)!;
	}

	public async setJuanitaGuild(guildId: string, guild: Guild): Promise<JuanitaGuild> {
		const modelsGuild = await setGuildIfNotExists(guild);
		const juanitaGuild = new JuanitaGuild(this, guild);
		if (modelsGuild) juanitaGuild.lang = modelsGuild.language as keyof JuanitaMessage;
		this.guildCommander.set(guildId, juanitaGuild);
		return this.getJuanitaGuild(guildId);
	}

	public hasJuanitaGuild(guildId: string) {
		return this.guildCommander.has(guildId);
	}

	public deleteJuanitaGuild(guildId: string) {
		this.guildCommander.delete(guildId);
	}
}
