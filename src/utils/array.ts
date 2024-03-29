import { StringSelectMenuBuilder } from '@discordjs/builders';
import type { Track } from 'discord-player';

export const getSelectMenuByPage = (tracks: Track[], page: number) => {
	let selectMenu = new StringSelectMenuBuilder();
	for (const track of tracks.slice(page * 25, (page + 1) * 25)) {
		const index = tracks.indexOf(track);
		selectMenu.addOptions({
			label: `${index + 1}. ${track.title.slice(0, 50)}`,
			value: `${index}`,
		});
	}
	return selectMenu;
};
