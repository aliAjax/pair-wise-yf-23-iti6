import type { TimelineTrack } from "../types/TimelineTrack";

export const createDefaultTimelineTrack = (overrides: Partial<TimelineTrack> = {}): TimelineTrack => ({
  id: 1 as never,
  cue_scene_id: 1 as never,
  start_ms: "0" as never,
  duration_ms: "4800" as never,
  layer: "1" as never,
  locked: "false" as never,
  updated_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createTimelineTrackForm = createDefaultTimelineTrack;
export const createTimelineTrackResponse = createDefaultTimelineTrack;
