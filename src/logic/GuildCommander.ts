import { CommandMessage } from "@typeit/discord";
import { Guild, TextChannel } from "discord.js";
import JuanitaGuild from "./JuanitaGuild";

export class GuildCommander {
  static _guilds = new Map<string, JuanitaGuild>();
  static refresh = (guild_id: string, command: CommandMessage): boolean => {
    if (command.member!.voice.channel === undefined) {
      return false;
    }
    if (!GuildCommander._guilds.has(guild_id))
      GuildCommander.insert(command.guild!);
    const guild = GuildCommander._guilds.get(guild_id);
    guild!.textChannel = command.channel as TextChannel;
    if (!guild!.queue.playing) {
      guild!.voiceChannel = command.member!.voice.channel;
    }
    return true;
  };

  static has = (guild_id: string): boolean => {
    return GuildCommander._guilds.has(guild_id);
  };

  static insert = (guild: Guild): void => {
    const { id, name } = guild;
    if (!GuildCommander.has(id)) {
      GuildCommander._guilds.set(id, new JuanitaGuild(id, name));
    }
  };

  static get = (guild: Guild): JuanitaGuild => {
    GuildCommander.insert(guild);
    return GuildCommander._guilds.get(guild.id)!;
  };
}
