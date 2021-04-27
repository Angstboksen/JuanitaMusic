import {
  GuildMember,
  MessageEmbed,
  StreamDispatcher,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import Queue from "./Queue";

export default class JuanitaGuild {
  id: string;
  name: string;
  textChannel: TextChannel | null = null;
  voiceChannel: VoiceChannel | null = null;
  dispatcher: StreamDispatcher | null = null;
  connection: VoiceConnection | null = null;
  queue: Queue = new Queue(this);

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  validateConnection = async (): Promise<void> => {
    if (this.connection === null || this.voiceChannel === null) {
      await this.connect();
    }
  };

  connect = async (): Promise<void> => {
    this.connection = await this.voiceChannel!.join();
  };

  leave = (): void => {
    this.queue = new Queue(this);
    if (this.voiceChannel !== null) this.voiceChannel!.leave();
    this.connection = null;
    this.voiceChannel = null;
    if (this.dispatcher !== null) this.dispatcher.destroy();

    this.dispatcher = null;
  };

  send = (msg: string | MessageEmbed): void => {
    this.textChannel!.send(msg);
  };

  join = async (member: GuildMember): Promise<void> => {
    this.voiceChannel = member.voice.channel;
    await this.connect();
  };
}
