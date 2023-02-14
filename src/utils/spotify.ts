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
	// parse out playlistid in spotify uri and url when url looks likehttps://open.spotify.com/playlist/4BGFC3yiyQVNTDeMDirTfl?si=0a0a0a0a0a0a0a0a
	// and uri looks like spotify:playlist:4BGFC3yiyQVNTDeMDirTfl
	const regex = /spotify:playlist:([a-zA-Z0-9]+)/;
	const regex2 = /open.spotify.com\/playlist\/([a-zA-Z0-9]+)/;
	const match = uri.match(regex);
	const match2 = uri.match(regex2);
	if (match) return match[1];
	if (match2) return match2[1];
	return null;
};
