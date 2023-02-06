import type { Guild } from 'discord.js';
import { GuildApi, ModelsGuild, ModelsLanguage } from '../.generated/api/api';
import { apiInstance, baseURL } from './ApiHttpBase';

const guildApi = new GuildApi(undefined, baseURL, apiInstance);

export const validateGuild = async (guildId: string): Promise<ModelsGuild | null> => {
	try {
		const res = await guildApi.getGuild(guildId);
		return res.status === 200 ? res.data : null;
	} catch (_) {
		return null;
	}
};

export const setGuildIfNotExists = async (guild: Guild): Promise<ModelsGuild | null> => {
	const guildExists = await validateGuild(guild.id);
	if (guildExists) return guildExists;
	try {
		const res = await guildApi.createGuild({
			id: guild.id,
			name: guild.name,
			permissionrole: 'user',
			language: 'no',
			aliases: [],
		});
		return res.status === 201 ? res.data : null;
	} catch (_) {
		return null;
	}
};

export const getAllGuilds = async (): Promise<ModelsGuild[] | null> => {
	try {
		const res = await guildApi.getGuilds();
		return res.status === 200 ? res.data : null;
	} catch (_) {
		return null;
	}
};

export const changeGuildLanguage = async (guildId: string, language: ModelsLanguage): Promise<boolean> => {
	try {
		const res = await guildApi.updateGuildLanguage(guildId, { language });
		console.log(res);
		return res.status === 200;
	} catch (_) {
		return false;
	}
};
