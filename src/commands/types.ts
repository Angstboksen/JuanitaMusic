import type { Player } from "discord-player";
import type { ApplicationCommandOption, CommandInteraction } from "discord.js";
import type JuanitaClient from "../JuanitaClient";

export interface JuanitaCommand {
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	voiceChannel?: boolean;
	execute: (options: JuanitaCommandOptions) => Promise<any>;
}

type JuanitaCommandOptions = {
	interaction: CommandInteraction;
	client?: JuanitaClient
	player?: Player
}
