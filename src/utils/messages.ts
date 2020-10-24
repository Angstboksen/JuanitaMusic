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
};

export const BROADCAST = {
  ready: "IM ALIVE",
  down: "IM DOWN",
  restart: "IM RESTARTING",
  disconnect: "IM DISCONNECTING",
};

export const LOGGER = {
  RUNNING_COMMAND: (type: string, tag: string) =>
    `Running command: '${type}' | By user: ${tag}`,
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
};
