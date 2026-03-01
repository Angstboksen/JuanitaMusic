import type { CommandInteraction, ApplicationCommandOptionData } from "discord.js";
import type { JuanitaClient } from "../client.js";
import type { Language } from "../i18n/types.js";

export interface JuanitaCommand {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  voiceChannel?: boolean;
  execute: (ctx: CommandContext) => Promise<void>;
}

export interface CommandContext {
  interaction: CommandInteraction;
  client: JuanitaClient;
  lang: Language;
}
