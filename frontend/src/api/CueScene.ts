import type { CueScene } from "../types/CueScene";
import { dbList, dbPut } from "../utils/db";

const endpoint = "/api/cue-scene";

export async function listCueScene(): Promise<CueScene[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local IndexedDB fallback keeps the UI available during offline review.
    }
  }
  return dbList<CueScene>("cueScene");
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  console.info("save CueScene", payload);
  return dbPut<CueScene>("cueScene", payload);
}
