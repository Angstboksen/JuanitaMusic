import { EventEmitter } from "events";
import { MusicPlayer, type MusicPlayerOptions } from "./player.js";
import type { Track } from "./track.js";

export class PlayerManager extends EventEmitter {
  private players = new Map<string, MusicPlayer>();

  create(options: MusicPlayerOptions): MusicPlayer {
    // Return existing player if one exists
    const existing = this.players.get(options.guildId);
    if (existing) return existing;

    const player = new MusicPlayer(options);

    // Forward events
    player.on("trackStart", (p: MusicPlayer, t: Track) => this.emit("trackStart", p, t));
    player.on("trackEnd", (p: MusicPlayer, t: Track) => this.emit("trackEnd", p, t));
    player.on("queueEmpty", (p: MusicPlayer) => this.emit("queueEmpty", p));

    // Auto-remove on destroy
    player.on("destroyed", () => {
      this.players.delete(options.guildId);
    });

    this.players.set(options.guildId, player);
    return player;
  }

  get(guildId: string): MusicPlayer | undefined {
    return this.players.get(guildId);
  }

  destroy(guildId: string): void {
    const player = this.players.get(guildId);
    if (player) {
      player.destroy();
      // player.destroy() emits "destroyed" which removes from map
    }
  }
}
