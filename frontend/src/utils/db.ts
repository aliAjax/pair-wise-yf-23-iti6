import { mockData } from "../mocks/seedData";

const DB_NAME = "stage-light";
const DB_VERSION = 1;
const SEED_FLAG = "stage-light:seeded";

export const DB_STORES = {
  fixture: "fixture",
  cueScene: "cueScene",
  timelineTrack: "timelineTrack",
  showProject: "showProject"
} as const;

export type DbStoreName = keyof typeof DB_STORES;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(DB_STORES).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function seedIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG)) return;
  const db = await openDb();
  await Promise.all(
    (Object.keys(DB_STORES) as DbStoreName[]).map(
      (name) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(DB_STORES[name], "readwrite");
          const store = tx.objectStore(DB_STORES[name]);
          mockData[name].forEach((row) => store.put(row));
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        })
    )
  );
  localStorage.setItem(SEED_FLAG, String(Date.now()));
}

export async function dbList<T>(name: DbStoreName): Promise<T[]> {
  await seedIfNeeded();
  const db = await openDb();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(DB_STORES[name], "readonly");
    const request = tx.objectStore(DB_STORES[name]).getAll();
    request.onsuccess = () => resolve((request.result as T[]) ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function dbPut<T>(name: DbStoreName, row: T): Promise<T> {
  await seedIfNeeded();
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(DB_STORES[name], "readwrite");
    tx.objectStore(DB_STORES[name]).put(row);
    tx.oncomplete = () => resolve(row);
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbPutMany<T>(name: DbStoreName, rows: T[]): Promise<T[]> {
  if (rows.length === 0) return rows;
  await seedIfNeeded();
  const db = await openDb();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(DB_STORES[name], "readwrite");
    const store = tx.objectStore(DB_STORES[name]);
    rows.forEach((row) => store.put(row));
    tx.oncomplete = () => resolve(rows);
    tx.onerror = () => reject(tx.error);
  });
}
