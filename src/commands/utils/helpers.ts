import { CommandMessage } from "@typeit/discord";
import SETUP_CONFIG from "../../config";
import { Logger } from "../../logger/Logger";
import { GuildCommander } from "../../logic/GuildCommander";

export enum RegexOrString {
  REGEX = "regex",
  STRING = "string",
}

export const validateAlias = (
  command: CommandMessage | undefined,
  aliases: string[],
  type: RegexOrString,
  returnObject: string = "$"
) => {
  if (command) {
    const cmd = command.content.split(" ")[0];

    for (const alias of aliases) {
      if (cmd === `${SETUP_CONFIG.prefix}${alias}`)
        return type === RegexOrString.REGEX
          ? new RegExp(`${alias + returnObject}`, "i")
          : `${alias + returnObject}`;
    }
  }
  return type === RegexOrString.REGEX
    ? new RegExp(`${aliases[0] + returnObject}`, "i")
    : `${aliases[0] + returnObject}`;
};

export const logAndRefresh = (
  name: string,
  author: string,
  id: string,
  command: CommandMessage
) => {
  Logger._logCommand(name, author);
  GuildCommander.refresh(id, command);
};
