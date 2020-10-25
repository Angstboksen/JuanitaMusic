import { IPlaylist } from "./api";

export const ERRORS = {
  COMMAND_NOT_EXIST:
    ":liar: **Tullekopp, det er jo ikke en gyldig kommando** :poop:",
  COMMAND_WRONG_FORMAT:
    ":thinking: **Det var ikke helt riktig måte å bruke den kommandoen på** :poop:",
  USER_NOT_IN_VOICE:
    ":robot: **Du må være i en voice channel bro!** :thinking:",
  BROADCAST_NO_ACCESS: (id: string) =>
    `CANNOT BROADCAST: NO ACCESS TO CHANNEL ${id}`,
  SONG_PLAY_FAIL: `:disappointed_relieved: **Det skjedde en feil med avspillingen av denne linken ** :rotating_light:`,
  NO_SONG_FOUND: (keywords: string[]) =>
    `:x: **Ingen sang funnet med denne søkestrengen:** ${keywords.join(
      " "
    )}:x:`,
  NEED_MORE_SONG_INFO:
    ":x: **Du må spesifisere hva som skal avspilles mannen!** :x:",
  ARGUMENT_NOT_INTEGER:
    ":robot: **Argument nr.2 må være et gyldig tall** :thinking:",
  NOT_VALID_QUEUE_INDEX: ":robot: **Ikke en gyldig index** :thinking:",
  NO_LIST_EXISTS: (playlistname: string) =>
    `:x: **Ingen liste** ${playlistname} **eksisterer** :x:`,
  QUEUE_NOT_FOUND: `:x: **Finner ingen kø** :x:`,
  PLAYLIST_HAS_NO_SONGS: (playlistname: string) =>
    `:clown: **Spillelisten:** ${playlistname} **har ingen sanger** :clown:`,
  FAIL_MAKE_LIST: (playlistname: string) =>
    `:x: **Kunne ikke mekke ny liste med navn:** ${playlistname}`,
  NO_LIST_ACCESS:
    ":police_car: :cop: **Du har ikke lov til å endre denne listen** :scroll: :rotating_light:",
  SONG_ALREADY_EXISTS:
    ":rotating_light: **Sangen finnes allerede i listen!** :rotating_light:",
};

export const BROADCAST = {
  ready: ":100: Im online and ready to recieve commands! :100:",
  down: ":skull: Im shutting down for now :skull:",
  restart: ":arrows_counterclockwise: Im restarting, brb :arrows_counterclockwise:",
  disconnect: ":skull: Im disconnecting :skull:",
};

export const LOGGER = {
  RUNNING_COMMAND: (type: string, tag: string) =>
    `Running command: '${type}' | By user: ${tag}`,
  NO_CONNECTION_COMMAND: "Ran command without connection",
};

export const MESSAGES = {
  QUEUE_EMPTY:
    ":white_check_mark: :scroll: **Da var denne køen ferdig for denne gang!** :white_check_mark:",
  SONG_INFO: (
    title: string,
    url: string,
    size: number,
    estimatedtime: string
  ) => `:notes: **Tittel:** ${title} 
    :beginner: **Youtube link:** ${url}
    :arrows_counterclockwise: **Antall sanger fortsatt i køen:** ${size}
    :timer: **Beregnet tid:** ${estimatedtime}`,
  ADDED_TO_QUEUE: (title: string) =>
    `:white_check_mark: **La til** ${title} **i køen** :white_check_mark:`,
  SKIP_SONG: ":mage: **Skippetipangen, bort med den sangen!** :no_entry:",
  SKIP_ALOT: (amount: number) =>
    `:mage: **Skipper som f${"æ".repeat(amount)}n!** :no_entry:`,
  PLAYLIST_INFO: (name: string, amount: number, creator: string) =>
    `:printer: **Liste:** ${name} | **Antall sanger:** ${amount} **Administrator:** <@!${creator}> :scroll: \n`,
  EMPTY_PLAYLIST_INFO:
    ":clown: **Fant ingen lister :rolling_eyes: Du kan lage en ny en ved å bruke:** !pp create <navn_på_liste>",
  AMOUNT_OF_LISTS: (length: number) =>
    `:scroll: **Antall lister:** ${length} :scroll:`,
  PLAYLIST_SONG_INFORMATION: (playlist: IPlaylist) => {
    let text = "**Songs** \n";
    let count = 0;
    for (let song of playlist.songs) {
      if (text.length > 1500) {
        break;
      }
      count++;
      text += `**${count}) :notes: Title:** ${song.title.replace("*", "")} \n`;
    }
    if (count === 0) {
      text += "List contains no songs";
    }
    text += `\n**Owner:** \n<@!${playlist.creator}>`;
    text += "\n**Trusted users:** \n";

    for (let trusted of playlist.trustedusers) {
      text += `<@!${trusted}> `;
    }
    return text;
  },
  REMOVED_SONG_FROM_QUEUE: (title: string) =>
    `:mage: **Fjernet** ${title} **køen listen** :scroll:`,
  GET_SONG_INFO: (
    title: string,
    url: string,
    size: number,
    estimatedtime: string
  ) => `:notes: **Tittel:** ${title}
    :beginner: **Youtube link:** ${url}
    :arrows_counterclockwise: **Antall sanger fortsatt i køen:** ${size}
    :timer: **Beregnet tid:** ${estimatedtime}`,
  NO_CURRENT_SONG: ":robot: **Det er ingen sang som spiller ** :thinking:",
  ADDED_NEW_LIST: (playlistname: string, sender: string) =>
    `:white_check_mark: **Mekka ny liste til deg ladden:** ${playlistname} - **Administrator:** <@!${sender}>`,
  ADDED_SONG_TO_LIST: (title: string) =>
    `:white_check_mark: **La til:** ${title} **i listen** :scroll:`,
  REMOVED_SONG: (title: string) =>
    `:mage: **Fjernet** ${title} **fra listen** :scroll:`,
  REMOVED_LIST: (playlistname: string) =>
    `:mage: **Fjernet listen:** ${playlistname} :scroll:`,
};
