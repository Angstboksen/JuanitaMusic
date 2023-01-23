export type JuanitaMessage = {
	en: string;
	no: string;
	molde: string;
};

// Generic error messages:
export const GENERIC_ERROR: JuanitaMessage = {
	en: '❌ An error occurred, please try again later!',
	no: '❌ En feil oppstod, prøv igjen senere!',
	molde: '❌ FAEN I HÆLVETTE NA DRITEN HER FUCKA SE!',
};

export const GENERIC_CANT_JOIN_CHANNEL = {
	en: '❌ I am unable to join the voice channel. Check if I have access to it!',
	no: '❌ Jeg får ikke til å joine kanalen. Sjekk om jeg har tilgang til den!',
	molde: '❌ KA FAEN! I FÅR IKKJE JOINA KANALEN! SJEKK OM I HAR TILGANG TIL NA FITTA!',
};

export const GENERIC_NO_TEXT_CHANNEL = {
	en: '❌ I do not have access to the given text channel!',
	no: '❌ Jeg har ikke tilgang til den gitte textkanalen!',
	molde: '❌ FAEN E DU DUM! I KAN IKKJE GJØRE NOKKA I DENNE KANALEN!',
};

export const GENERIC_EMPTY_QUEUE = {
	en: '❌ The queue is empty!',
	no: '❌ Køen er tom!',
	molde: '❌ KØA E TOM! FAEN E DU DUM!',
};

// User error messages:
export const USER_NOT_IN_VOICE: JuanitaMessage = {
	en: '❌ You are not in a Voice Channel',
	no: '❌ Du er ikke i en voice kanal',
	molde: '❌ FAEN E DU HEILT RETARD!? DU E IKKJE I VOICE!',
};

export const USER_NOT_IN_SAME_VOICE: JuanitaMessage = {
	en: '❌ You are not in the same Voice Channel as me',
	no: '❌ Du er ikke i samme voice kanal som meg',
	molde: '❌ ASSÅ FAEN SÅ JÆVLA DUM DU E! DU MÅ VÆRE I SAMMME KANAL SOM ME!',
};

// Command error messages:
// GENERIC:
export const GENERIC_NO_MUSIC_PLAYING_ERROR: JuanitaMessage = {
	en: '❌ There is no music playing right now',
	no: '❌ Det spilles ingen musikk for øyeblikket',
	molde: '❌ I SPILLE IKKJE MUSIKK NO JÆVLA HORE',
};

export const GENERIC_NO_PREVIOUS_TRACK_ERROR: JuanitaMessage = {
	en: '❌ There is no previous track to play',
	no: '❌ Det er ingen tidligere sang å spille',
	molde: '❌ I KAN IKKJE SPILLE EN SANG SOM IKKJE FINNES!',
};

export const COMMAND_NOT_FOUND_ERROR: JuanitaMessage = {
	en: '❌ Command does not exist!',
	no: '❌ Kommandoen finnes ikke!',
	molde: '❌ NA KOMMANDOEN FINNES IKKJE, JÆVLA TARD!',
};

// JUMP:
export const JUMP_QUEUE_POSITION_ERROR: JuanitaMessage = {
	en: '❌ Please provide a valid queue position between:',
	no: '❌ Vennligst oppgi en gyldig kø posisjon mellom:',
	molde: '❌ HERREGUD DU E DUM! GI ME EN GYLDIG POSISJON I KØA MELLOM:',
};

// PLAY:
export const PLAY_NO_TRACKS_FOUND_ERROR = {
	en: '❌ No results found for search: ',
	no: '❌ Fant ingen resultater for søk: ',
	molde: '❌ KA I HÆLVETTE, KOS DU FORVENTE AT I SKAL FINNE NOKKA MED TA ELENDIGE SØKET: ',
};

// FIRST:
export const FIRST_PLAYLIST_NOT_SUPPORTED = {
	en: '❌ This command does not support playlists!',
	no: '❌ Denne kommandoen støtter ikke spillelister!',
	molde: '❌ FAEN I FITTE! KOMMANDOEN STØTTE IKKJE SPILLELISTER!',
};

// SEEK:
export const SEEK_INVALID_TIME_ERROR = {
	en: '❌ The time you provided is invalid for this song! Try again with a valid time.',
	no: '❌ Tiden du oppga er ugyldig for denne sangen! Prøv igjen.',
	molde: '❌',
};

// RESUME:
export const RESUME_ALREADY_RESUMED_ERROR = {
	en: '❌ The song is already playing!',
	no: '❌ Sangen spilles allerede!',
	molde: '❌ SANGEN SPILLES ALLEREDE!',
};

// PAUSE:
export const PAUSE_ALREADY_PAUSED_ERROR = {
	en: '❌ The song is already paused!',
	no: '❌ Sangen er allerede pauset!',
	molde: '❌ SANGEN ER ALLEREDE PAUSA!',
};

// QUEUE:
export const QUEUE_PREV_PAGE_ERROR = {
	en: '❌ There is no previous page!',
	no: '❌ Det er ingen forrige side!',
	molde: '❌ DET FINNES IKKJE EN FORRIGE SIDE!',
};

export const QUEUE_NEXT_PAGE_ERROR = {
	en: '❌ There is no next page!',
	no: '❌ Det er ingen neste side!',
	molde: '❌ DET FINNES IKKJE EN NESTE SIDE!',
};

// Command success messages:
// HELP:
export const HELP_COMMAND_DESCRIPTION = {
	en: '**Here is a list of all commands** 📝\nYou can also use "/help <command>" to get more information about a specific command ✨',
	no: '**Her er en liste over alle kommandoer** 📝\nDu kan også bruke "/help <kommando>" for å få mer informasjon om en spesifikk kommando ✨',
	molde:
		'**Her er ei liste over alle kommandoer** 📝\nDu kan også bruke "/help <kommando>" for å få meir informasjon om ei spesifikk kommando ✨',
};

export const HELP_COMMAND_AMOUNT = {
	en: 'Amount of commands:',
	no: 'Antall kommandoer:',
	molde: 'Antall kommandoer:',
};

// BACK:
export const BACK_PLAYING_TRACK_SUCCESS = {
	en: '🔙 Playing previous track: ',
	no: '🔙 Spiller forrige sang: ',
	molde: '🔙 Spiller forrige sang: ',
};

// CLEAR:
export const CLEAR_QUEUE_SUCCESS = {
	en: '🗑️ Cleared the queue!',
	no: '🗑️ Tømte køen!',
	molde: '🗑️ Tømte køa!',
};

// JUMP:
export const JUMP_SUCCESS = {
	en: '⏭️ Jumped to track: ',
	no: '⏭️ Hoppet til sang: ',
	molde: '⏭️ Hoppa til sang: ',
};

// LOOP:
export const LOOP_TRACK_EMBED_SUCCESS = {
	en: '🔁 Looping track: ',
	no: '🔁 Looper sang: ',
	molde: '🔁 Looping sang: ',
};

export const LOOP_QUEUE_EMBED_SUCCESS = {
	en: '🔁 Looping entire queue!',
	no: '🔁 Looper hele køen!',
	molde: '🔁 Looper hele køa!',
};

export const LOOP_OFF_EMBED_SUCCESS = {
	en: '🔁 Looping disabled!',
	no: '🔁 Looping av!',
	molde: '🔁 Looping av!',
};

// PAUSE:
export const PAUSE_SUCCESS = {
	en: 'has been paused!',
	no: 'er satt på pause!',
	molde: 'e satt på pause!',
};

// PLAY:
export const PLAY_PLAYLIST_SUCCESS = {
	en: '✅ Added all songs from playlist: ',
	no: '✅ La til alle sanger fra spillelista: ',
	molde: '✅ La til alle sanger fra spillelista: ',
};

export const PLAY_TRACK_SUCCESS = {
	en: '✅ Added track: ',
	no: '✅ La til sang: ',
	molde: '✅ La til sang: ',
};

// QUEUE:
export const QUEUE_AUTHOR_NAME = {
	en: 'This is the current state of the queue',
	no: 'Dette er nåværende status for køen',
	molde: 'Ta er nåværende status for køa',
};

export const QUEUE_NOW_PLAYING = {
	en: '**🎶 Now playing:**',
	no: '**🎶 Spiller nå:**',
	molde: '**🎶 Spiller no:**',
};

export const QUEUE_ADDED_BY = {
	en: '**👤 Added by:**',
	no: '**👤 Lagt til av:**',
	molde: '**👤 Lagt til av:**',
};

export const QUEUE_TOTAL_TIME = {
	en: 'Total time left:',
	no: 'Total tid igjen:',
	molde: 'Total tid igjen:',
};

export const QUEUE_SONG_AMOUNT = {
	en: 'Amount of songs in queue:',
	no: 'Antall sanger i køen:',
	molde: 'Antall sanger i køa:',
};

export const QUEUE_SELECT_PLACEHOLDER = {
	en: 'Open me to view the queue | Page:',
	no: 'Åpne meg for å se køen | Side:)',
	molde: 'Åpne me for å se køa | Side:',
};

export const QUEUE_SILENT_SUCCESS = {
	en: '✅ Sending queue message!',
	no: '✅ Sender kømelding!',
	molde: '✅ Sender kømelding!',
};

// REMOVE:
export const REMOVE_SUCCESS = {
	en: '🗑️ Removed track: ',
	no: '🗑️ Fjernet sang: ',
	molde: '🗑️ Fjerna sang: ',
};

// RESUME:
export const RESUME_SUCCESS = {
	en: 'has been resumed!',
	no: 'er satt på igjen!',
	molde: 'e satt på igjen!',
};

// SEEK:
export const SEEK_SUCCESS = {
	en: '⏩ Moved to time: ',
	no: '⏩ Spolet til: ',
	molde: '⏩ Spolet til: ',
};

// SHUFFLE:
export const SHUFFLE_SUCCESS = {
	en: '🔀 Shuffled the queue!',
	no: '🔀 Shufflet køen!',
	molde: '🔀 Shuffla køa!',
};

// SKIP:
export const SKIP_FROM_SUCCESS = {
	en: '⏭️ Skipping track: ',
	no: '⏭️ Skipper sang: ',
	molde: '⏭️ Skipper sang: ',
};

export const SKIP_TO_SUCCESS = {
	en: '🎶 Next track: ',
	no: '🎶 Neste sang: ',
	molde: '🎶 Neste sang: ',
};

export const SKIP_EMPTY_QUEUE = {
	en: '😢 The queue is empty!',
	no: '😢 Køen er tom!',
	molde: '😢 Køa er tom!',
};

// KYS:
export const KYS_SUCCESS = {
	en: '👋 Ait I`m out',
	no: '👋 Chattes a!',
	molde: '👋 Chattes a!',
};

// BUTTON LABELS:
export const KYS_BUTTON_LABEL = {
	en: '💀KYS',
	no: '💀KYS',
	molde: '💀KYS',
};

export const NEXT_BUTTON_LABEL = {
	en: '➡️Next',
	no: '➡️Neste',
	molde: '➡️Neste',
};

export const PREVIOUS_BUTTON_LABEL = {
	en: '⬅️Previous',
	no: '⬅️Forrige',
	molde: '⬅️Forrige',
};

export const PAUSE_BUTTON_LABEL = {
	en: '⏸️Pause',
	no: '⏸️Pause',
	molde: '⏸️Pause',
};

export const RESUME_BUTTON_LABEL = {
	en: '▶️Resume',
	no: '▶️Resume',
	molde: '▶️Resume',
};

export const SHUFFLE_BUTTON_LABEL = {
	en: '🔀Shuffle',
	no: '🔀Shuffle',
	molde: '🔀Shuffle',
};

export const SKIP_BUTTON_LABEL = {
	en: '⏭️Skip',
	no: '⏭️Skip',
	molde: '⏭️Skip',
};
