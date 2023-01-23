import type { Player } from "discord-player";
import type { ApplicationCommandOption, CommandInteraction } from "discord.js";
import type JuanitaClient from "../JuanitaClient";
import type JuanitaGuild from "../structures/JuanitaGuild";

export interface JuanitaCommand {
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	voiceChannel?: boolean;
	execute: (options: JuanitaCommandOptions) => Promise<any>;
}

type JuanitaCommandOptions = {
	interaction: CommandInteraction;
	juanitaGuild: JuanitaGuild;
	client?: JuanitaClient;
	player?: Player;
};
