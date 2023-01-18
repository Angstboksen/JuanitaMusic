import type { ApplicationCommandOption, CommandInteraction } from "discord.js";

export interface JuanitaCommand {
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	execute: (interaction: CommandInteraction) => Promise<void>;
}
