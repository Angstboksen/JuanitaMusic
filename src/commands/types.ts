import type { Player } from "discord-player";
import type { ApplicationCommandOption, CommandInteraction } from "discord.js";
import type JuanitaClient from "../JuanitaClient";
import type { JuanitaMessage } from "../embeds/messages";

export interface JuanitaCommand {
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	voiceChannel?: boolean;
	execute: (options: JuanitaCommandOptions) => Promise<any>;
}

type JuanitaCommandOptions = {
	interaction: CommandInteraction;
	lang: keyof JuanitaMessage;
	client?: JuanitaClient;
	player?: Player;
};
