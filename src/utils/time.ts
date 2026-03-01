export function millisecondsToTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export function buildProgressBar(positionMs: number, durationMs: number, paused: boolean, barLength = 16): string {
  const ratio = durationMs > 0 ? Math.min(positionMs / durationMs, 1) : 0;
  const filledCount = Math.round(ratio * barLength);
  const empty = "━";
  const knob = "●";
  const icon = paused ? "⏸" : "▶";

  const bar = empty.repeat(filledCount) + knob + empty.repeat(barLength - filledCount);
  return `${icon} ${bar} ${millisecondsToTime(positionMs)} / ${millisecondsToTime(durationMs)}`;
}
