import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import { findFirstDmxConflict, type DmxConflict } from "../utils/dmx";

/** 扫描灯具列表，返回第一对占用同一段 DMX 地址的灯具 */
export function useDmxAddressCheck(fixtures: Fixture[]): { conflict: DmxConflict | null; hasConflict: boolean } {
  const conflict = useMemo(() => findFirstDmxConflict(fixtures), [fixtures]);
  return { conflict, hasConflict: conflict !== null };
}
