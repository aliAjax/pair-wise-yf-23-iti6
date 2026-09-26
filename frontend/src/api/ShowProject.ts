import type { ShowProject } from "../types/ShowProject";
import { dbList, dbPut } from "../utils/db";

const endpoint = "/api/show-project";

export async function listShowProject(): Promise<ShowProject[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local IndexedDB fallback keeps the UI available during offline review.
    }
  }
  return dbList<ShowProject>("showProject");
}

export async function saveShowProject(payload: ShowProject): Promise<ShowProject> {
  console.info("save ShowProject", payload);
  return dbPut<ShowProject>("showProject", payload);
}
