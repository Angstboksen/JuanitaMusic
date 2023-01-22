import type { JuanitaButtonOptions } from "./types";

export default async ({ interaction, queue }: JuanitaButtonOptions) => {
	if (!queue || !queue.playing)
		return interaction.reply({ content: `No music currently playing... try again ? ❌`, ephemeral: true });

	const success = queue.setPaused(true);
	if (!success) queue.setPaused(false);

	return interaction.reply({
		content: `Current music ${queue.current.title} ${success ? "paused" : "resumed"} ✅`,
		ephemeral: true,
	});
};
