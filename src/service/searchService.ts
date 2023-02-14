import { ModelsSearch, SearchApi } from "../.generated/api/api";
import { apiInstance, baseURL } from "./ApiHttpBase";

const searchApi = new SearchApi(undefined, baseURL, apiInstance);

export const storeSearch = async (search: ModelsSearch): Promise<boolean> => {
    try {
        const res = await searchApi.createSearch(search);
        return res.status === 201;
    } catch {
        return false;
    }
}
