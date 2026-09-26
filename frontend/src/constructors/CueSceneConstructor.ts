import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 1 as never,
  name: "开场暖色" as never,
  fixture_states: "{\"1\":[255,180,80]}" as never,
  fade_in_ms: "800" as never,
  hold_ms: "4000" as never,
  priority: "10" as never,
  scene_status: "READY" as never,
  updated_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
