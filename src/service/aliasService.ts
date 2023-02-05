import { AliasApi, ModelsAlias } from '../.generated/api/api';
import { apiInstance, baseURL } from './ApiHttpBase';

const aliasApi = new AliasApi(undefined, baseURL, apiInstance);

export const getAliasesByGuild = async (guildId: string): Promise<ModelsAlias[]> => {
	const res = await aliasApi.getAliases(guildId);
	if (res.status === 200) {
		return res.data;
	}
	return [];
};

export const validateAlias = async (guildId: string, alias: string): Promise<boolean> => {
	const res = await aliasApi.getByAlias(guildId, alias);
	return res.status === 200;
};
