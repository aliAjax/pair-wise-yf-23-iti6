import type { TimelineTrack } from "../types/TimelineTrack";
import { dbList, dbPut } from "../utils/db";

const endpoint = "/api/timeline-track";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local IndexedDB fallback keeps the UI available during offline review.
    }
  }
  return dbList<TimelineTrack>("timelineTrack");
}

export async function saveTimelineTrack(payload: TimelineTrack): Promise<TimelineTrack> {
  console.info("save TimelineTrack", payload);
  return dbPut<TimelineTrack>("timelineTrack", payload);
}
