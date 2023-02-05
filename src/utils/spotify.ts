import axios from 'axios';

export const validateSpotifyURI = async (uri: string): Promise<string> => {
	const URL = `https://open.spotify.com/playlist/${uri}`;
	try {
		const res = await axios.get(URL);
		return res.status === 200 ? uri : '';
	} catch (_) {
		return '';
	}
};
