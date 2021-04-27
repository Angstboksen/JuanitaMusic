import MockDiscord from "../../__tests__/MockDiscord";
import { GuildCommander } from "../GuildCommander";

describe("Test GuildCommander.ts class", () => {
  const md = new MockDiscord();
  beforeEach(() => {
    GuildCommander._guilds.clear();
  });

  afterAll((done) => {
    md.getClient().destroy();
    done();
  });

  test("Guildcommander constructor", () => {
    expect(GuildCommander).toBeDefined();
  });

  test("Guildcommander.insert() method", () => {
    expect(GuildCommander._guilds.size).toBe(0);
    const g = md.getGuild();
    GuildCommander.insert(g);
    expect(GuildCommander._guilds.size).toBe(1);
    GuildCommander.insert(g);
    expect(GuildCommander._guilds.size).toBe(1);
  });

  test("Guildcommander.get() method", () => {
    const g = md.getGuild();
    const j = GuildCommander.get(g);
    expect(j.name).toBe(g.name);
    expect(j.id).toBe(g.id);
    g.name = "not-exist";
    g.id = "not-exist";
    expect(GuildCommander.has(g.id)).toBe(false);
  });
});
