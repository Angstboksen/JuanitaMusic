import { EmbedBuilder } from 'discord.js';

export enum EmbedType {
	Success = 'Success',
	Error = 'Error',
	Info = 'Info',
}

const SimpleEmbed = (description: string, type: EmbedType) =>
	new EmbedBuilder()
		.setColor(type === EmbedType.Success ? '#00ff00' : type === EmbedType.Error ? '#ff0000' : '#0000ff')
		.setDescription(description);

export default SimpleEmbed;
