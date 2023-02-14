import { AliasApi, ModelsAlias } from '../.generated/api/api';
import { apiInstance, baseURL } from './ApiHttpBase';

const aliasApi = new AliasApi(undefined, baseURL, apiInstance);

export const getAliasesByGuild = async (guildId: string): Promise<ModelsAlias[]> => {
	try {
		const res = await aliasApi.getAliases(guildId);
		return res.status === 200 ? res.data : [];
	} catch {
		return [];
	}
};

export const validateAlias = async (guildId: string, alias: string): Promise<boolean> => {
	try {
		const res = await aliasApi.getByAlias(guildId, alias);
		return res.status === 200;
	} catch {
		return false;
	}
};

export const createAlias = async (guildId: string, alias: string, playlistid: string): Promise<ModelsAlias | null> => {
	try {
		const res = await aliasApi.createAlias(guildId, {
			alias,
			playlistid,
		});
		console.log(res)
		return res.status === 201 ? res.data : null;
	} catch {
		return null;
	}
};
