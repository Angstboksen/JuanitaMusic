import type { LocalizedString } from "./types.js";

// === Error messages ===

export const GENERIC_ERROR: LocalizedString = {
  en: "An error occurred, please try again later!",
  no: "En feil oppstod, prøv igjen senere!",
  molde: "FAEN I HÆLVETTE NA DRITEN HER FUCKA SE!",
};

export const CANT_JOIN_CHANNEL: LocalizedString = {
  en: "I am unable to join the voice channel. Check if I have access!",
  no: "Jeg får ikke til å joine kanalen. Sjekk om jeg har tilgang!",
  molde: "KA FAEN! I FÅR IKKJE JOINA KANALEN! SJEKK OM I HAR TILGANG TE NA FITTA!",
};

export const NO_MUSIC_PLAYING: LocalizedString = {
  en: "There is no music playing right now",
  no: "Det spilles ingen musikk for øyeblikket",
  molde: "I SPILLE IKKJE MUSIKK NO JÆVLA HORE",
};

export const NOT_IN_VOICE: LocalizedString = {
  en: "You are not in a Voice Channel",
  no: "Du er ikke i en voice kanal",
  molde: "FAEN E DU HEILT RETARD!? DU E IKKJE I VOICE!",
};

export const NOT_IN_SAME_VOICE: LocalizedString = {
  en: "You are not in the same Voice Channel as me",
  no: "Du er ikke i samme voice kanal som meg",
  molde: "ASSÅ FAEN SÅ JÆVLA DUM DU E! DU MÅ VÆRE I SAMMME KANAL SOM ME!",
};

export const EMPTY_QUEUE: LocalizedString = {
  en: "The queue is empty!",
  no: "Køen er tom!",
  molde: "KØA E TOM! FAEN E DU DUM!",
};

export const NO_PREVIOUS_TRACK: LocalizedString = {
  en: "There is no previous track to play",
  no: "Det er ingen tidligere sang å spille",
  molde: "I KAN IKKJE SPILLE EN SANG SOM IKKJE FINNES JÆVLA MONGO!",
};

export const COMMAND_NOT_FOUND: LocalizedString = {
  en: "Command does not exist!",
  no: "Kommandoen finnes ikke!",
  molde: "NA KOMMANDOEN FINNES IKKJE, JÆVLA TARD!",
};

export const NO_RESULTS: LocalizedString = {
  en: "No results found for search:",
  no: "Fant ingen resultater for søk:",
  molde: "KA I HÆLVETTE, KORDAN DU FORVENTE AT I SKAL FINNE NOKKA MED TA ELENDIGE SØKET:",
};

export const INVALID_POSITION: LocalizedString = {
  en: "Please provide a valid queue position between:",
  no: "Vennligst oppgi en gyldig kø posisjon mellom:",
  molde: "HERREGUD DU E DUM! GI ME EN GYLDIG POSISJON I KØA MELLOM:",
};

export const INVALID_SEEK_TIME: LocalizedString = {
  en: "The time you provided is invalid for this song!",
  no: "Tiden du oppga er ugyldig for denne sangen!",
  molde: "FY FAEN DU E TARD! PRØV Å LEGG INN GYLDIG TID DA MONGO!",
};

export const ALREADY_PAUSED: LocalizedString = {
  en: "The song is already paused!",
  no: "Sangen er allerede pauset!",
  molde: "SANGEN E ALLEREDE PAUSA!",
};

export const ALREADY_PLAYING: LocalizedString = {
  en: "The song is already playing!",
  no: "Sangen spilles allerede!",
  molde: "SANGEN SPILLES ALLEREDE DI FORBANNA FITTE!",
};

export const LANGUAGE_INVALID: LocalizedString = {
  en: "You have to provide a valid language.\nSupported languages:",
  no: "Du må gi et gyldig språk.\nSpråk som støttes:",
  molde: "DU MÅ GI ME ET GYLDIG SPRÅK.\nSPRÅKA SOM STØTTES NO ER:",
};

// === Success messages ===

export const TRACK_ADDED: LocalizedString = {
  en: "Added track:",
  no: "La til sang:",
  molde: "LA TE SANG:",
};

export const PLAYLIST_ADDED: LocalizedString = {
  en: "Added all songs from playlist:",
  no: "La til alle sanger fra spillelista:",
  molde: "LA TE ALLE SANGAN FRA SPILLELISTA:",
};

export const SKIP_FROM: LocalizedString = {
  en: "Skipping track:",
  no: "Skipper sang:",
  molde: "SKIPPA SANG:",
};

export const SKIP_TO: LocalizedString = {
  en: "Next track:",
  no: "Neste sang:",
  molde: "NESTE SANG:",
};

export const SHUFFLE_SUCCESS: LocalizedString = {
  en: "Shuffled the queue!",
  no: "Shufflet køen!",
  molde: "SHUFFLA KØA!",
};

export const CLEAR_SUCCESS: LocalizedString = {
  en: "Cleared the queue!",
  no: "Tømte køen!",
  molde: "TØMTE KØA I MORDI!",
};

export const PAUSE_SUCCESS: LocalizedString = {
  en: "has been paused!",
  no: "er satt på pause!",
  molde: "E SATT PÅ PAUSE!",
};

export const RESUME_SUCCESS: LocalizedString = {
  en: "has been resumed!",
  no: "er satt på igjen!",
  molde: "E SATT PÅ IGJEN!",
};

export const KYS_SUCCESS: LocalizedString = {
  en: "Ait I'm out",
  no: "Chattes a!",
  molde: "SUG PÅ DENNA!",
};

export const BACK_SUCCESS: LocalizedString = {
  en: "Playing previous track:",
  no: "Spiller forrige sang:",
  molde: "SPILLER FORRIGE SANG:",
};

export const JUMP_SUCCESS: LocalizedString = {
  en: "Jumped to track:",
  no: "Hoppet til sang:",
  molde: "HOPPA TE SANG:",
};

export const SEEK_SUCCESS: LocalizedString = {
  en: "Moved to time:",
  no: "Spolet til:",
  molde: "SPOLA TE:",
};

export const REMOVE_SUCCESS: LocalizedString = {
  en: "Removed track:",
  no: "Fjernet sang:",
  molde: "FJERNA SANG:",
};

export const LANGUAGE_SET: LocalizedString = {
  en: "Language set to:",
  no: "Språk satt til:",
  molde: "SPRÅK SATT TE:",
};

export const QUEUE_SENDING: LocalizedString = {
  en: "Sending queue message!",
  no: "Sender kømelding!",
  molde: "SENDE KØMELDING!",
};

// === Queue embed strings ===

export const QUEUE_NOW_PLAYING: LocalizedString = {
  en: "**Now playing:**",
  no: "**Akkurat nå:**",
  molde: "**AKKURAT NO:**",
};

export const QUEUE_ADDED_BY: LocalizedString = {
  en: "**Added by:**",
  no: "**Lagt til av:**",
  molde: "**LAGT TE AV:**",
};

export const QUEUE_UP_NEXT: LocalizedString = {
  en: "Up Next",
  no: "Neste opp",
  molde: "NESTE OPP",
};

export const QUEUE_EMPTY: LocalizedString = {
  en: "The queue is empty! Use `/play <song>` to add a song!",
  no: "Køen er tom! Bruk `/play <sang>` for å legge til en sang!",
  molde: "KØA E TOM! BRUK `/play <sang>` FOR Å LEGGE TE EN SANG!",
};

// === Button labels ===

export const BTN_KYS: LocalizedString = { en: "KYS", no: "KYS", molde: "KYS" };
export const BTN_BACK: LocalizedString = { en: "Back", no: "Tilbake", molde: "TILBAKE" };
export const BTN_SKIP: LocalizedString = { en: "Skip", no: "Skip", molde: "SKIP" };
export const BTN_PAUSE: LocalizedString = { en: "Pause", no: "Pause", molde: "PAUSE" };
export const BTN_RESUME: LocalizedString = { en: "Resume", no: "Fortsett", molde: "FORTSETT" };
export const BTN_SHUFFLE: LocalizedString = { en: "Shuffle", no: "Shuffle", molde: "SHUFFLE" };

// === Help ===

export const HELP_DESCRIPTION: LocalizedString = {
  en: "**Here is a list of all commands**\nUse `/help <command>` for more info",
  no: "**Her er en liste over alle kommandoer**\nBruk `/help <kommando>` for mer info",
  molde: "**HER E LISTA MED ALLE KOMMANDOA LILLE TØS**\nBRUK `/help <kommando>` HVIS DU E RETARD",
};

// === Alias messages ===

export const ALIAS_SAVED: LocalizedString = {
  en: "Alias saved!",
  no: "Alias lagret!",
  molde: "ALIAS LAGRA!",
};

export const ALIAS_DELETED: LocalizedString = {
  en: "Alias deleted!",
  no: "Alias slettet!",
  molde: "ALIAS SLETTA!",
};

export const ALIAS_NOT_FOUND: LocalizedString = {
  en: "Alias not found!",
  no: "Alias ikke funnet!",
  molde: "FANT IKKJE ALIASET DANSEN!",
};

export const ALIAS_LIST_EMPTY: LocalizedString = {
  en: "No aliases saved for this server.",
  no: "Ingen alias lagret for denne serveren.",
  molde: "INGEN ALIAS LAGRA FOR DENNA SERVEREN!",
};

export const ALIAS_LIST_TITLE: LocalizedString = {
  en: "Saved aliases",
  no: "Lagrede alias",
  molde: "LAGRA ALIAS",
};
