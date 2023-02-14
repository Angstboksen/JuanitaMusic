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

export const retrieveSpotifyPlaylistId = (uri: string): string | null => {
	const spotifyRegex = /(?:spotify:playlist:|https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]+)/;
	const match = uri.match(spotifyRegex);
	return match ? match[1]! : null;

};
