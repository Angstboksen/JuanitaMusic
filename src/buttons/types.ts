import type { Queue } from "discord-player";
import type { ButtonInteraction } from "discord.js";
import type JuanitaClient from "../JuanitaClient";
import type JuanitaGuild from "../structures/JuanitaGuild";

export type JuanitaButtonOptions = {
	interaction: ButtonInteraction;
	queue: Queue;
	client: JuanitaClient;
	customId: { ffp: string };
	juanitaGuild: JuanitaGuild
};
