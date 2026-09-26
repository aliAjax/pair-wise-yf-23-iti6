import type { Fixture } from "../types/Fixture";

export interface DmxRange {
  start: number;
  end: number;
}

export interface DmxConflict {
  a: Fixture;
  b: Fixture;
  rangeA: DmxRange;
  rangeB: DmxRange;
}

/** 灯具占用的地址段：[dmx_address, dmx_address + channel_count - 1]，无法解析时返回 null */
export function dmxRangeOf(fixture: Fixture): DmxRange | null {
  const start = Number.parseInt(fixture.dmx_address, 10);
  const count = Number(fixture.channel_count);
  if (!Number.isInteger(start) || start < 1 || !Number.isInteger(count) || count < 1) return null;
  return { start, end: start + count - 1 };
}

export function dmxRangesOverlap(a: DmxRange, b: DmxRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** 按编号升序扫描，返回第一对占用同一段地址的不同灯具 */
export function findFirstDmxConflict(fixtures: Fixture[]): DmxConflict | null {
  const sorted = [...fixtures].sort((x, y) => x.id - y.id);
  for (let i = 0; i < sorted.length; i += 1) {
    const a = sorted[i];
    const rangeA = a ? dmxRangeOf(a) : null;
    if (!a || !rangeA) continue;
    for (let j = i + 1; j < sorted.length; j += 1) {
      const b = sorted[j];
      if (!b || a.id === b.id) continue;
      const rangeB = dmxRangeOf(b);
      if (rangeB && dmxRangesOverlap(rangeA, rangeB)) return { a, b, rangeA, rangeB };
    }
  }
  return null;
}

export const formatDmxRange = (range: DmxRange) => `${range.start}–${range.end}`;
