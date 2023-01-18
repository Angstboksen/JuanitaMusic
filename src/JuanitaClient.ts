import { Player } from 'discord-player';
import type { JuanitaConfig } from '../config';
import { Client, ClientOptions, Collection } from 'discord.js';
import loadClient from './loader';

type JuanitaClientOptions = ClientOptions;

export default class JuanitaClient extends Client {
	public player: Player;
	public config: JuanitaConfig;
	public commands: Collection<any, any> = new Collection();

	constructor(options: JuanitaClientOptions, config: JuanitaConfig) {
		super(options);
		this.player = new Player(this, config.opt.discordPlayer);
		this.config = config;
		loadClient(this);
	}
}
