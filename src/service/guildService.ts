import type { Guild } from 'discord.js';
import { GuildApi, ModelsGuild } from '../.generated/api/api';
import { apiInstance, baseURL } from './ApiHttpBase';

const guildApi = new GuildApi(undefined, baseURL, apiInstance);

export const validateGuild = async (guildId: string): Promise<boolean> => {
	try {
		const res = await guildApi.getGuild(guildId);
		return res.status === 200;
	} catch (_) {
		return false;
	}
};

export const setGuildIfNotExists = async (guild: Guild): Promise<boolean> => {
	const guildExists = await validateGuild(guild.id);
	if (guildExists) return false;
	try {
		const res = await guildApi.createGuild({
			id: guild.id,
			name: guild.name,
			permissionrole: 'user',
			language: 'no',
			aliases: [],
		});
		return res.status === 201;
	} catch (_) {
		return false;
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
