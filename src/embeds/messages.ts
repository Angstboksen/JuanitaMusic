export type JuanitaMessage = {
	en: string;
	no: string;
	molde: string;
};

// Generic error messages:
export const GENERIC_ERROR: JuanitaMessage = {
	en: `❌ An error occurred, please try again later!`,
	no: `❌ En feil oppstod, prøv igjen senere!`,
	molde: `❌ FAEN I HÆLVETTE NA DRITEN HER FUCKA SE!`,
};

export const GENERIC_CANT_JOIN_CHANNEL = {
	en: `❌ I am unable to join the voice channel. Check if I have access to it!`,
	no: `❌ Jeg får ikke til å joine kanalen. Sjekk om jeg har tilgang til den!`,
	molde: `❌ KA FAEN! I FÅR IKKJE JOINA KANALEN! SJEKK OM I HAR TILGANG TIL NA FITTA!`,
};

// User error messages:
export const USER_NOT_IN_VOICE: JuanitaMessage = {
	en: `❌ You are not in a Voice Channel`,
	no: `❌ Du er ikke i en voice kanal`,
	molde: `❌ FAEN E DU HEILT RETARD!? DU E IKKJE I VOICE!`,
};

export const USER_NOT_IN_SAME_VOICE: JuanitaMessage = {
	en: `❌ You are not in the same Voice Channel as me`,
	no: `❌ Du er ikke i samme voice kanal som meg`,
	molde: `❌ ASSÅ FAEN SÅ JÆVLA DUM DU E! DU MÅ VÆRE I SAMMME KANAL SOM ME!`,
};

// Command error messages:
// GENERIC:
export const GENERIC_NO_MUSIC_PLAYING_ERROR: JuanitaMessage = {
	en: `❌ There is no music playing right now`,
	no: `❌ Det spilles ingen musikk for øyeblikket`,
	molde: `❌ I SPILLE IKKJE MUSIKK NO JÆVLA HORE`,
};

export const GENERIC_NO_PREVIOUS_TRACK_ERROR: JuanitaMessage = {
	en: `❌ There is no previous track to play`,
	no: `❌ Det er ingen tidligere sang å spille`,
	molde: `❌ I KAN IKKJE SPILLE EN SANG SOM IKKJE FINNES!`,
};

export const COMMAND_NOT_FOUND_ERROR: JuanitaMessage = {
	en: `❌ Command does not exist!`,
	no: `❌ Kommandoen finnes ikke!`,
	molde: `❌ NA KOMMANDOEN FINNES IKKJE, JÆVLA TARD!`,
};

// JUMP:
export const JUMP_QUEUE_POSITION_ERROR: JuanitaMessage = {
	en: `❌ Please provide a valid queue position between:`,
	no: `❌ Vennligst oppgi en gyldig kø posisjon mellom:`,
	molde: `❌ HERREGUD DU E DUM! GI ME EN GYLDIG POSISJON I KØA MELLOM:`,
};

// PLAY:
export const PLAY_NO_TRACKS_FOUND_ERROR = {
	en: `❌ No results found for search: `,
	no: `❌ Fant ingen resultater for søk: `,
	molde: `❌ KA I HÆLVETTE, KOS DU FORVENTE AT I SKAL FINNE NOKKA MED TA ELENDIGE SØKET: `,
};

// FIRST:
export const FIRST_PLAYLIST_NOT_SUPPORTED = {
	en: `❌ This command does not support playlists!`,
	no: `❌ Denne kommandoen støtter ikke spillelister!`,
	molde: `❌ FAEN I FITTE! KOMMANDOEN STØTTE IKKJE SPILLELISTER!`,
};

// Command success messages:
// HELP:
export const HELP_COMMAND_DESCRIPTION = {
	en: `**Here is a list of all commands** 📝\nYou can also use \`/help <command>\` to get more information about a specific command ✨`,
	no: `**Her er en liste over alle kommandoer** 📝\nDu kan også bruke \`/help <kommando>\` for å få mer informasjon om en spesifikk kommando ✨`,
	molde: `**Her er ei liste over alle kommandoer** 📝\nDu kan også bruke \`/help <kommando>\` for å få meir informasjon om ei spesifikk kommando ✨`,
};

export const HELP_COMMAND_AMOUNT = {
	en: `Amount of commands:`,
	no: `Antall kommandoer:`,
	molde: `Antall kommandoer:`,
};

// BACK:
export const BACK_PLAYING_TRACK_SUCCESS = {
	en: `🔙 Playing previous track: `,
	no: `🔙 Spiller forrige sang: `,
	molde: `🔙 Spiller forrige sang: `,
};

// CLEAR:
export const CLEAR_QUEUE_SUCCESS = {
	en: "🗑️ Cleared the queue!",
	no: "🗑️ Tømte køen!",
	molde: "🗑️ Tømte køa!",
};

// JUMP:
export const JUMP_SUCCESS = {
	en: `⏭️ Jumped to track: `,
	no: `⏭️ Hoppet til sang: `,
	molde: `⏭️ Hoppa til sang: `,
};

// LOOP:
export const LOOP_TRACK_EMBED_SUCCESS = {
	en: `🔁 Looping track: `,
	no: `🔁 Looper sang: `,
	molde: `🔁 Looping sang: `,
};

export const LOOP_QUEUE_EMBED_SUCCESS = {
	en: `🔁 Looping entire queue!`,
	no: `🔁 Looper hele køen!`,
	molde: `🔁 Looper hele køa!`,
};

export const LOOP_OFF_EMBED_SUCCESS = {
	en: `🔁 Looping disabled!`,
	no: `🔁 Looping av!`,
	molde: `🔁 Looping av!`,
};

// PAUSE:
export const PAUSE_SUCCESS = {
	en: `has been paused!`,
	no: `er satt på pause!`,
	molde: `e satt på pause!`,
};

// PLAY:
export const PLAY_PLAYLIST_SUCCESS = {
	en: `✅ Added all songs from playlist: `,
	no: `✅ La t alle sanger fra spillelista: `,
	molde: `✅ La til alle sanger fra spillelista: `,
};

export const PLAY_TRACK_SUCCESS = {
	en: `✅ Added track: `,
	no: `✅ La til sang: `,
	molde: `✅ La til sang: `,
};

// QUEUE:

// REMOVE:

// RESUME:

// SEEK:

// SHUFFLE:

// SKIP:

export const SKIP_SUCCESS = {
	en: `⏭️ Skipped track: `,
	no: `⏭️ Skippet sang: `,
	molde: `⏭️ Skippet sang: `,
};
