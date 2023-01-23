import type JuanitaGuild from "./JuanitaGuild";

export default class JuanitaGuildCommander {
    public guilds = new Map<string, JuanitaGuild>();

    public get(guildId: string): JuanitaGuild | undefined {
        return this.guilds.get(guildId);
    }

    public set(guildId: string, guild: JuanitaGuild): void {
        this.guilds.set(guildId, guild);
    }

    public delete(guildId: string): void {
        this.guilds.delete(guildId);
    }

    public has(guildId: string): boolean {
        return this.guilds.has(guildId);
    }
}