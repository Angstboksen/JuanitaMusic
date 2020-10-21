import {
  Channel,
  Client,
  Collection,
  DiscordAPIError,
  Guild,
  Message,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { BroadcastEnum } from "../utils/enums";
import { ERRORS, BROADCAST } from "../utils/messages";
import { ICommand } from "../utils/api";
import { commandTypes } from "../utils/helpers";

export default class Juanita {
  _allUsers: User[];
  _client: Client;
  _guilds: Guild[];
  _textChannels: TextChannel[];
  _commands: ICommand[];

  constructor(client: Client) {
    this._client = client;
    this._commands = [];
    this._allUsers = [];
    this._guilds = [];
    this._textChannels = [];
  }

  public _initialize = () => {
    this.loadCommands();
    this.loadUsers();
    this.loadGuilds();
    this.loadChannels();
    this.broadcast(BroadcastEnum.READY);
  };

  public broadcast = async (type: BroadcastEnum) => {
    const broadcastText: string = BROADCAST[type];
    for (let channel of this._textChannels) {
      /*await channel.send(broadcastText).catch(() => {
        console.log(ERRORS.BROADCAST_NO_ACCESS(channel.id));
      });*/
    }
    console.log(`Broadcasted with type: ${type}`);
  };

  public execute = async (message: Message, tokens: string[]) => {
    for(let command of this._commands) {
        if(command.isValid(tokens)) {
            command.run(message, tokens)
        }
    }
  };

  public wrongCommand = async (channel: TextChannel) => {
    this.sendMessage(channel, ERRORS.COMMAND_NOT_EXIST);
  };

  public sendMessage = (textChannel: TextChannel, content: string | MessageEmbed) => {
    textChannel.send(content);
  };

  loadChannels = () => {
    const clientChannels: Collection<string, Channel> = this._client.channels
      .cache;
    for (let channel of clientChannels) {
      if (channel[1].type === "text") {
        this._textChannels.push(channel[1] as TextChannel);
      }
    }
  };

  loadGuilds = () => {
    const clientGuilds: Collection<string, Guild> = this._client.guilds.cache;
    for (let guild of clientGuilds) {
      this._guilds.push(guild[1]);
    }
  };

  loadUsers = () => {
    const clientUsers: Collection<string, User> = this._client.users.cache;
    for (let user of clientUsers) {
      this._allUsers.push(user[1]);
    }
  };

  loadCommands = () => {
    if (
      !commandTypes ||
      !Array.isArray(commandTypes) ||
      commandTypes.length === 0
    ) {
      throw new Error("Invalid / empty commands list");
    }

    for (const cmdName of commandTypes) {
      const cmdClass = require(`${__dirname}/commands/${cmdName}`).default;
      const command = new cmdClass() as ICommand;
      this._commands.push(command);
    }
  };
}
