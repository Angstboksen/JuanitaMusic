export const ERRORS = {
  COMMAND_NOT_EXIST:
    ":liar: **Tullekopp, det er jo ikke en gyldig kommando** :poop:",
  COMMAND_WRONG_FORMAT:
    ":thinking: **Det var ikke helt riktig måte å bruke den kommandoen på** :poop:",
  USER_NOT_IN_VOICE:
    ":robot: **Du må være i en voice channel bro!** :thinking:",
  BROADCAST_NO_ACCESS: (id: string) =>
    `CANNOT BROADCAST: NO ACCESS TO CHANNEL ${id}`,
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
