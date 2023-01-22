import type { Queue } from "discord-player";
import type { ButtonInteraction } from "discord.js";
import type JuanitaClient from "../JuanitaClient";

export type JuanitaButtonOptions = {
	interaction: ButtonInteraction;
	queue: Queue;
	client: JuanitaClient;
	customId: { ffp: string };
};
