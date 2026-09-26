import type { Fixture } from "../types/Fixture";

export interface DmxRange {
  start: number;
  channels: number;
  end: number;
}

export function parseDmxRange(fixture: Pick<Fixture, "dmx_address" | "channel_count">): DmxRange | null {
  const start = Number(String(fixture.dmx_address).trim());
  const channels = Number(fixture.channel_count);
  if (!Number.isFinite(start) || !Number.isFinite(channels)) return null;
  if (start < 1 || channels < 1) return null;
  return { start, channels, end: start + channels - 1 };
}

export function dmxRangesOverlap(a: DmxRange, b: DmxRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

export function formatDmxRange(range: DmxRange): string {
  return range.channels === 1 ? String(range.start) : `${range.start}-${range.end}`;
}
