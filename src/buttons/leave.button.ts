import type { JuanitaButtonOptions } from './types';

export default async ({ interaction, queue }: JuanitaButtonOptions) => {
	if (!queue || !queue.playing)
		return interaction.reply({ content: `No music currently playing... try again ? ❌`, ephemeral: true });

	queue.destroy();

	return interaction.reply({ content: `Im out!`, ephemeral: true });
};
