import { EmbedBuilder } from "discord.js";

export enum EmbedType {
  Success = "#00ff00",
  Error = "#ff0000",
  Info = "#0000ff",
}

export function simpleEmbed(description: string, type: EmbedType): EmbedBuilder {
  return new EmbedBuilder().setColor(type).setDescription(description);
}
