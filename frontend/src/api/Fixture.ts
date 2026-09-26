import type { Fixture } from "../types/Fixture";
import { dbList, dbPut } from "../utils/db";

const endpoint = "/api/fixture";

export async function listFixture(): Promise<Fixture[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local IndexedDB fallback keeps the UI available during offline review.
    }
  }
  return dbList<Fixture>("fixture");
}

export async function saveFixture(payload: Fixture): Promise<Fixture> {
  console.info("save Fixture", payload);
  return dbPut<Fixture>("fixture", payload);
}
