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
	molde: '❌ KA FAEN! I FÅR IKKJE JOINA KANALEN! SJEKK OM I HAR TILGANG TE NA FITTA!',
};

export const GENERIC_NO_TEXT_CHANNEL = {
	en: '❌ I do not have access to the given text channel!',
	no: '❌ Jeg har ikke tilgang til den gitte textkanalen!',
	molde: '❌ FAEN E DU DUM! I KAN IKKJE GJØRE NOKKA I DENNA KANALEN!',
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
	molde: '❌ I KAN IKKJE SPILLE EN SANG SOM IKKJE FINNES JÆVLA MONGO!',
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

export const JUMP_QUEUE_EMPTY_ERROR = {
	en: '❌ The queue is empty! You cannot skip multiple songs.',
	no: '❌ Køen er tom! Du kan ikke hoppe lengre inn i den.',
	molde: '❌ FAEN DA! DU KAN IKKJE SKIPPE LANGT INN I EI TOM KØ FORBANNA IDIOT!',
};

// PLAY:
export const PLAY_NO_TRACKS_FOUND_ERROR = {
	en: '❌ No results found for search: ',
	no: '❌ Fant ingen resultater for søk: ',
	molde: '❌ KA I HÆLVETTE, KORDAN DU FORVENTE AT I SKAL FINNE NOKKA MED TA ELENDIGE SØKET: ',
};

// FIRST:
export const FIRST_PLAYLIST_NOT_SUPPORTED = {
	en: '❌ This command does not support playlists!',
	no: '❌ Denne kommandoen støtter ikke spillelister!',
	molde: '❌ FAEN I FITTE! KOMMANDOEN STØTTE IKKJE SPILLELISTA!',
};

// SEEK:
export const SEEK_INVALID_TIME_ERROR = {
	en: '❌ The time you provided is invalid for this song! Try again with a valid time.',
	no: '❌ Tiden du oppga er ugyldig for denne sangen! Prøv igjen.',
	molde: '❌ FY FAEN DU E TARD! PRØV Å LEGG INN GYLDIG TID DA MONGO!',
};

// RESUME:
export const RESUME_ALREADY_RESUMED_ERROR = {
	en: '❌ The song is already playing!',
	no: '❌ Sangen spilles allerede!',
	molde: '❌ SANGEN SPILLES ALLEREDE DI FORBANNA FITTE!',
};

// PAUSE:
export const PAUSE_ALREADY_PAUSED_ERROR = {
	en: '❌ The song is already paused!',
	no: '❌ Sangen er allerede pauset!',
	molde: '❌ SANGEN E ALLEREDE PAUSA!',
};

// QUEUE:
export const QUEUE_PREV_PAGE_ERROR = {
	en: '❌ There is no previous page!',
	no: '❌ Det er ingen forrige side!',
	molde: '❌ DET FINNES IKKJE EN FORRIGE SIDE FORPULTE HORUNGE!',
};

export const QUEUE_NEXT_PAGE_ERROR = {
	en: '❌ There is no next page!',
	no: '❌ Det er ingen neste side!',
	molde: '❌ DET FINNES IKKJE EN NESTE SIDE DIN MONGOLOIDE NISSE!',
};

// SPOTIFY

export const SPOTIFY_PLAYLIST_NOT_PROVIDED_ERROR = {
	en: '❌ No playlist provided!',
	no: '❌ Du må gi meg en spilleliste',
	molde: '❌ FAEN DA! E DU HEILT TARD! GI ME EI LISTE!',
};

export const SPOTIFY_PLAYLIST_NOT_EXIST_ERROR = {
	en: '❌ Could not find the provided playlist',
	no: '❌ Fant ingen spilleliste med gjeldende ID eller alias',
	molde: '❌ NA SPILLELISA FINNES IKKJE!',
};

// REMEMBER
export const REMEMBER_OPTIONS_ERROR = {
	en: '❌ Give a valid playlistID and an alias not already used in this guild!',
	no: '❌ Gi en gyldig spillelisteID og et alias som ikke allerede er brukt',
	molde: '❌ FAEN! DU MÅ GI ME EI GYLDIG SPILLELISTEID OG ET ALIAS SOM IKKJE E BRUKT!',
}

export const REMEMBER_SPOTIFY_FORMAT_ERROR = {
	en: '❌ You must provide a spotify URI on the format: `spotify:playlist:<id>`',
	no: '❌ Du må gi meg en spotify URI på format: `spotify:playlist:<id>`',
	molde: '❌ GI DE! GI ME EN URI PÅ FORMATET: `spotify:playlist:<id>`',
}

// Command success messages:
// HELP:
export const HELP_COMMAND_DESCRIPTION = {
	en: '**Here is a list of all commands** 📝\nYou can also use "/help <command>" to get more information about a specific command ✨',
	no: '**Her er en liste over alle kommandoer** 📝\nDu kan også bruke "/help <kommando>" for å få mer informasjon om en spesifikk kommando ✨',
	molde:
		'**HER E LISTA MED ALLE KOMMANDOA LILLE TØS** 📝\nDU KAN OGSÅ BRUKE "/help <kommando>" HVIS DU E RETARD OG TRENG MEIR INFO OM EI SPESIFIKK KOMMANDO ✨',
};

export const HELP_COMMAND_AMOUNT = {
	en: 'Amount of commands:',
	no: 'Antall kommandoer:',
	molde: 'ANTALL KOMMANDOA:',
};

// BACK:
export const BACK_PLAYING_TRACK_SUCCESS = {
	en: '🔙 Playing previous track: ',
	no: '🔙 Spiller forrige sang: ',
	molde: '🔙 SPILLER FORRIGE SANG: ',
};

// CLEAR:
export const CLEAR_QUEUE_SUCCESS = {
	en: '🗑️ Cleared the queue!',
	no: '🗑️ Tømte køen!',
	molde: '🗑️ TØMTE KØA I MORDI!',
};

// JUMP:
export const JUMP_SUCCESS = {
	en: '⏭️ Jumped to track: ',
	no: '⏭️ Hoppet til sang: ',
	molde: '⏭️ HOPPA TE SANG: ',
};

// LOOP:
export const LOOP_TRACK_EMBED_SUCCESS = {
	en: '🔁 Looping track: ',
	no: '🔁 Looper sang: ',
	molde: '🔁 LOOPE SANG: ',
};

export const LOOP_QUEUE_EMBED_SUCCESS = {
	en: '🔁 Looping entire queue!',
	no: '🔁 Looper hele køen!',
	molde: '🔁 LOOPE HEILE KØA!',
};

export const LOOP_OFF_EMBED_SUCCESS = {
	en: '🔁 Looping disabled!',
	no: '🔁 Looping av!',
	molde: '🔁 LOOPING AV!',
};

// PAUSE:
export const PAUSE_SUCCESS = {
	en: 'has been paused!',
	no: 'er satt på pause!',
	molde: 'E SATT PÅ PAUSE!',
};

// PLAY:
export const PLAY_PLAYLIST_SUCCESS = {
	en: '✅ Added all songs from playlist: ',
	no: '✅ La til alle sanger fra spillelista: ',
	molde: '✅ LA TE ALLE SANGAN FRA SPILLELISTA: ',
};

export const PLAY_TRACK_SUCCESS = {
	en: '✅ Added track: ',
	no: '✅ La til sang: ',
	molde: '✅ LA TE SANG: ',
};

// QUEUE:
export const QUEUE_AUTHOR_NAME = {
	en: 'This is the current state of the queue',
	no: 'Dette er nåværende status for køen',
	molde: 'TA E NÅVÆRENDE STATUS FOR KØA',
};

export const QUEUE_NOW_PLAYING = {
	en: '**🎶 Now playing:**',
	no: '**🎶 Akkurat nå:**',
	molde: '**🎶 AKKURAT NO:**',
};

export const QUEUE_ADDED_BY = {
	en: '**👤 Added by:**',
	no: '**👤 Lagt til av:**',
	molde: '**👤 LAGT TE AV:**',
};

export const QUEUE_TOTAL_TIME = {
	en: 'Total time left:',
	no: 'Total tid igjen:',
	molde: 'TOTAL TID IGJEN:',
};

export const QUEUE_SONG_AMOUNT = {
	en: 'Amount of songs in queue:',
	no: 'Antall sanger i køen:',
	molde: 'ANTALL SANGA I KØA:',
};

export const QUEUE_SELECT_PLACEHOLDER = {
	en: 'Open me to view the queue | Songs:',
	no: 'Åpne meg for å se køen | Sanger:',
	molde: 'ÅPNE ME FOR Å SE KØA DI HORE | Sanga:',
};

export const QUEUE_SILENT_SUCCESS = {
	en: '✅ Sending queue message!',
	no: '✅ Sender kømelding!',
	molde: '✅ SENDE KØMELDING!',
};

export const QUEUE_NEXT_SONG = {
	en: '**Next song in queue:**',
	no: '**Neste sang i køen:**',
	molde: '**NESTE SANG I KØA:**',
};

export const QUEUE_NO_SONGS = {
	en: '😢 The queue is empty! use `/play <song or YouTube URL>` to add a song!',
	no: '😢 Køen er tom! Bruk `/play <sang eller YouTube URL>` for å legge til en sang!',
	molde: '😢 KØA E TOM! BRUK `/play <sang eller YouTube URL>` FOR Å LEGGE TE EN SANG!',
};

// REMOVE:
export const REMOVE_SUCCESS = {
	en: '🗑️ Removed track: ',
	no: '🗑️ Fjernet sang: ',
	molde: '🗑️ FJERNA SANG: ',
};

// RESUME:
export const RESUME_SUCCESS = {
	en: 'has been resumed!',
	no: 'er satt på igjen!',
	molde: 'E SATT PÅ IGJEN!',
};

// SEEK:
export const SEEK_SUCCESS = {
	en: '⏩ Moved to time: ',
	no: '⏩ Spolet til: ',
	molde: '⏩ SPOLA TE: ',
};

// SHUFFLE:
export const SHUFFLE_SUCCESS = {
	en: '🔀 Shuffled the queue!',
	no: '🔀 Shufflet køen!',
	molde: '🔀 SHUFFLA KØA!',
};

// SKIP:
export const SKIP_FROM_SUCCESS = {
	en: '⏭️ Skipping track: ',
	no: '⏭️ Skipper sang: ',
	molde: '⏭️ SKIPPA SANG: ',
};

export const SKIP_TO_SUCCESS = {
	en: '🎶 Next track: ',
	no: '🎶 Neste sang: ',
	molde: '🎶 NESTE SANG: ',
};

export const SKIP_EMPTY_QUEUE = {
	en: '😢 The queue is empty!',
	no: '😢 Køen er tom!',
	molde: '😢 JÆVLA HORUNGE! KØA E TOM!',
};

// KYS:
export const KYS_SUCCESS = {
	en: '👋 Ait I`m out',
	no: '👋 Chattes a!',
	molde: '🍆 SUG PÅ DENNA!',
};

// SPOTIFY:
export const SPOTIFY_PLAYING_BY_ID = {
	en: '🎶 Loaded songs from playlist with ID: ',
	no: '🎶 Lastet inn sanger fra spilleliste med ID: ',
	molde: '🎶 LASTA INN SANGA FRÅ SPILLELISTA MED ID: ',
};

export const SPOTIFY_LOADING_ALIAS = {
	en: '🎶 Loading songs from playlist: ',
	no: '🎶 Laster inn sanger fra spilleliste: ',
	molde: '🎶 LASTE INN SANGA FRA SPILLELISTA: ',
};

// REMEMBER
export const REMEMBER_SUCCESS_ONE = {
	en: '📝 I will now remember: ',
	no: '📝 Jeg husker nå: ',
	molde: '📝 I HUSKE NO: ',
};

export const REMEMBER_SUCCESS_TWO = {
	en: 'as: ',
	no: 'som: ',
	molde: 'SOM: ',
};

// BUTTON LABELS:
export const KYS_BUTTON_LABEL = {
	en: '💀KYS',
	no: '💀KYS',
	molde: '💀KYS',
};

export const NEXT_BUTTON_LABEL = {
	en: '➡️Next page',
	no: '➡️Neste side',
	molde: '➡️NESTE SIDE',
};

export const PREVIOUS_BUTTON_LABEL = {
	en: '⬅️Previous page',
	no: '⬅️Forrige side',
	molde: '⬅️FORRIGE SIDE',
};

export const PAUSE_BUTTON_LABEL = {
	en: '⏸️Pause',
	no: '⏸️Pause',
	molde: '⏸️PAUSE',
};

export const RESUME_BUTTON_LABEL = {
	en: '▶️Resume',
	no: '▶️Fortsett',
	molde: '▶️FORTSETT',
};

export const SHUFFLE_BUTTON_LABEL = {
	en: '🔀Shuffle',
	no: '🔀Shuffle',
	molde: '🔀Shuffle',
};

export const SKIP_BUTTON_LABEL = {
	en: '⏭️Skip',
	no: '⏭️Skip',
	molde: '⏭️SKIP',
};
