import { Message } from "discord.js";
import { CommandEnum } from "./enums";

export interface IUser {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
}

export interface ICommand {
  type: CommandEnum;
  run(message: Message, tokens: string[]): void;
  isValid(tokens: string[]): boolean;
}

export interface IJuanitaMessage {
  user: IUser;
  setTextOnly(text: string): IJuanitaMessage;
  addField(name: string, value: string): IJuanitaMessage;
  setDescription(description: string): IJuanitaMessage;
  setFooter(text: string, icon?: string): IJuanitaMessage;
  setImage(url: string): IJuanitaMessage;
  setThumbnail(url: string): IJuanitaMessage;
  setTitle(title: string): IJuanitaMessage;
  setURL(url: string): IJuanitaMessage;
}
