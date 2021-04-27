import JuanitaGuild from "../JuanitaGuild";
import Queue from "../Queue";
import { testSong, testSongArray } from "./data";

describe("Test Queue.ts class", () => {
  const g = new JuanitaGuild("test-id", "TestName");
  let q = new Queue(g);

  beforeEach(() => {
    q = new Queue(g);
  });

  test("Queue constructor", () => {
    expect(q).toBeDefined();
    expect(q.songs).toStrictEqual([]);
    expect(q.playing).toBe(false);
    expect(q.paused).toBe(false);
    expect(q.current).toBe(null);
    expect(q.guild).toBe(g);
  });

  test("Queue.next() method", () => {
    q.songs = [...testSongArray];
    expect(q.next()).toStrictEqual(testSongArray[0]);
    q.songs = [];
    expect(q.next()).toBeNull();
  });

  test("Queue.size() method", () => {
    q.songs = [...testSongArray];
    expect(q.size()).toBe(testSongArray.length);
    q.songs = [];
    expect(q.size()).toBe(0);
  });

  test("Queue.inrange() method", () => {
    q.songs = [...testSongArray];
    expect(q.inrange(0)).toBe(true);
    expect(q.inrange(1)).toBe(true);
    expect(q.inrange(2)).toBe(true);
    expect(q.inrange(-1)).toBe(false);
    expect(q.inrange(4)).toBe(false);
    q.songs.pop();
    expect(q.inrange(3)).toBe(false);
  });

  test("Queue.kill() method", () => {
    q.songs = [...testSongArray];
    expect(q.kill(1)).toStrictEqual(testSongArray[1]);
    expect(q.size()).toBe(2);
    const t = [...testSongArray];
    t.splice(1, 1);
    expect(q.songs).toStrictEqual(t);
  });

  test("Queue.skipTo() method", () => {
    q.songs = [...testSongArray];
    expect(q.skipTo(2)).toStrictEqual(testSongArray[2]);
    expect(q.size()).toBe(1);
    const t = [...testSongArray].splice(2, testSongArray.length);
    expect(q.songs).toStrictEqual(t);
  });

  test("Queue.enqueue() method", () => {
    q.songs = [...testSongArray];
    expect(q.size()).toBe(testSongArray.length);
    q.enqueue({ ...testSong });
    expect(q.size()).toBe(testSongArray.length + 1);
    expect(q.songs[q.size() - 1]).toStrictEqual(testSong);

    // First
    q.enqueue({ ...testSong }, true);
    expect(q.size()).toBe(testSongArray.length + 2);
    expect(q.songs[0]).toStrictEqual(testSong);
  });

  test("Queue.dequeue() method", () => {
    q.songs = [...testSongArray];
    expect(q.size()).toBe(testSongArray.length);
    q.dequeue();
    expect(q.size()).toBe(testSongArray.length - 1);
    const t = [...testSongArray];
    t.shift();
    expect(q.songs).toStrictEqual(t);
  });

  test("Queue.clear() method", () => {
    q.playing = true;
    q.current = { ...testSong };
    q.songs = [...testSongArray];
    q.clear();
    expect(q.playing).toBe(false);
    expect(q.current).toBe(null);
    expect(q.songs).toStrictEqual([]);
  });

  test("Queue.stop() method", () => {
    q.playing = true;
    q.stop();
    expect(q.playing).toBe(false);
  });

  test("Queue.empty() method", () => {
    q.songs = [...testSongArray];
    expect(q.empty()).toBe(false);
    q.clear();
    expect(q.empty()).toBe(true);
  });
});
