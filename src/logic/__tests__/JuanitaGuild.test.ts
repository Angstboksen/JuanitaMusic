import MockDiscord from "../../__tests__/MockDiscord";
import JuanitaGuild from "../JuanitaGuild";

describe("Test JuanitaGuild.ts class", () => {
  const md = new MockDiscord();
  let g = new JuanitaGuild("test-id", "TestName");

  beforeEach(() => {
    g = new JuanitaGuild("test-id", "TestName");
  });

  test("JuanitaGuild constructor", () => {
    expect(g).toBeDefined();
    expect(g.id).toBe("test-id");
    expect(g.name).toBe("TestName");
    expect(g.textChannel).toBeNull();
    expect(g.voiceChannel).toBeNull();
    expect(g.dispatcher).toBeNull();
    expect(g.connection).toBeNull();
    expect(g.queue.guild).toBe(g);
  });

  test("JuanitaGuild.validateConnection() method", () => {
    g.connect = jest.fn();
    expect(g.connect).toHaveBeenCalledTimes(0);
    g.validateConnection();
    expect(g.connect).toHaveBeenCalledTimes(1);
  });

  test("JuanitaGuild.connect() method", () => {
    const v = md.getVoiceChannel();
    v.join = jest.fn();
    g.voiceChannel = v;
    g.connect();
    expect(v.join).toHaveBeenCalledTimes(1);
  });

  test("JuanitaGuild.leave() method", () => {
    const q = g.queue;
    const v = md.getVoiceChannel();
    v.leave = jest.fn();

    g.voiceChannel = v;
    g.leave();
    expect(q).not.toBe(g.queue);
    expect(v.leave).toHaveBeenCalledTimes(1);
    expect(g.connection).toBeNull();
    expect(g.voiceChannel).toBeNull();
    expect(g.dispatcher).toBeNull();
  });

  test("JuanitaGuild.send() method", () => {
    const t = md.getTextChannel();
    t.send = jest.fn();
    g.textChannel = t;
    expect(t.send).toHaveBeenCalledTimes(0);
    g.send("test");
    expect(t.send).toHaveBeenCalledTimes(1);
  });

  test("JuanitaGuild.join() method", () => {
    g.connect = jest.fn();
    g.join(md.getGuildMember());
    expect(g.connect).toHaveBeenCalledTimes(1);
  });
});
