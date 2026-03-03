import type { Track } from "./track.js";

export class Queue {
  current: Track | null = null;
  previous: Track[] = [];
  private upcoming: Track[] = [];

  get length(): number {
    return this.upcoming.length;
  }

  add(tracks: Track | Track[]): void {
    if (Array.isArray(tracks)) {
      this.upcoming.push(...tracks);
    } else {
      this.upcoming.push(tracks);
    }
  }

  shift(): Track | undefined {
    return this.upcoming.shift();
  }

  clear(): void {
    this.upcoming = [];
  }

  shuffle(): void {
    for (let i = this.upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.upcoming[i], this.upcoming[j]] = [this.upcoming[j]!, this.upcoming[i]!];
    }
  }

  splice(start: number, deleteCount: number): Track[] {
    return this.upcoming.splice(start, deleteCount);
  }

  [Symbol.iterator](): Iterator<Track> {
    return this.upcoming[Symbol.iterator]();
  }
}
