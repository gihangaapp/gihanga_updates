import type { Query, QueryClient } from "@tanstack/react-query";

/**
 * Small IndexedDB persistence layer for the social content users revisit most.
 * Cache entries are partitioned by authenticated user, restored before the
 * returning user's feed is mounted, and refreshed by React Query in the
 * background when stale. IndexedDB is optional: unsupported/private browsing
 * falls back to the in-memory QueryClient without changing app behavior.
 */
const DB_NAME = "gihanga-query-cache";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";
const SCHEMA_VERSION = 1;
const SCHEMA_KEY = "__schema_version__";
const SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PERSISTED_QUERIES = 50;
const MAX_PERSISTED_FEED_PAGES = 3;
const PERSIST_DEBOUNCE_MS = 180;

interface PersistedQuery {
  queryKey: readonly unknown[];
  data: unknown;
  updatedAt: number;
}
interface PersistedSnapshot {
  schemaVersion: number;
  storedAt: number;
  queries: PersistedQuery[];
}

let dbPromise: Promise<IDBDatabase | null> | null = null;
let schemaPromise: Promise<void> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T | null> {
  return openDatabase().then((db) => {
    if (!db) return null;
    return new Promise<T | null>((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = run(transaction.objectStore(STORE_NAME));
        let result: T | null = null;
        request.onsuccess = () => {
          result = (request.result ?? null) as T | null;
        };
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => resolve(null);
        transaction.onabort = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  });
}

async function ensureSchema() {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const version = await withStore<number>("readonly", (store) => store.get(SCHEMA_KEY));
    if (version !== SCHEMA_VERSION) {
      await withStore<undefined>("readwrite", (store) => store.clear());
      await withStore<number>("readwrite", (store) => store.put(SCHEMA_VERSION, SCHEMA_KEY));
    }
  })();
  return schemaPromise;
}

function storageKey(userId: string) {
  return `user:${userId}:query-snapshot`;
}

function isPersistableQuery(query: Query) {
  const root = query.queryKey[0];
  return (
    root === "posts" ||
    root === "recommendations" ||
    root === "stories" ||
    root === "profile" ||
    root === "user-profile" ||
    root === "following-set" ||
    root === "notifications"
  );
}

function trimQueryData(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const value = data as { pages?: unknown[]; pageParams?: unknown[] };
  if (!Array.isArray(value.pages) || value.pages.length <= MAX_PERSISTED_FEED_PAGES) return data;
  // Keep the newest pages. InfiniteQuery can continue from the saved last page's
  // cursor instead of forcing users to start from an empty feed after reload.
  return {
    ...value,
    pages: value.pages.slice(0, MAX_PERSISTED_FEED_PAGES),
    pageParams: Array.isArray(value.pageParams)
      ? value.pageParams.slice(0, MAX_PERSISTED_FEED_PAGES)
      : value.pageParams,
  };
}

export async function restoreUserQueryCache(
  queryClient: QueryClient,
  userId: string,
  isCurrent: () => boolean = () => true,
) {
  if (!userId) return;
  await ensureSchema();
  const snapshot = await withStore<PersistedSnapshot>("readonly", (store) =>
    store.get(storageKey(userId)),
  );
  if (
    !isCurrent() ||
    !snapshot ||
    snapshot.schemaVersion !== SCHEMA_VERSION ||
    !Array.isArray(snapshot.queries) ||
    Date.now() - snapshot.storedAt > SNAPSHOT_MAX_AGE_MS
  ) {
    return;
  }

  for (const entry of snapshot.queries) {
    if (!Array.isArray(entry.queryKey) || entry.data === undefined) continue;
    if (Date.now() - entry.updatedAt > SNAPSHOT_MAX_AGE_MS) continue;
    try {
      queryClient.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.updatedAt });
    } catch {
      // A malformed or old cache record should never prevent the live API path.
    }
  }
}

async function writeUserSnapshot(queryClient: QueryClient, userId: string) {
  if (!userId) return;
  // Capture the current account's data before awaiting IndexedDB. A sign-out or
  // account switch during database setup must not persist the next user's cache
  // under this user's storage key.
  const queries = queryClient
    .getQueryCache()
    .findAll()
    .filter((query) => isPersistableQuery(query) && query.state.data !== undefined)
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
    .slice(0, MAX_PERSISTED_QUERIES)
    .map((query) => ({
      queryKey: query.queryKey,
      data: trimQueryData(query.state.data),
      updatedAt: query.state.dataUpdatedAt || Date.now(),
    }));

  // Avoid writes that cannot be JSON-serialized (all API payloads should be
  // plain JSON, but one malformed cache item must not block the rest).
  let safeSnapshot: PersistedSnapshot;
  try {
    safeSnapshot = JSON.parse(
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, storedAt: Date.now(), queries }),
    ) as PersistedSnapshot;
  } catch {
    return;
  }
  await ensureSchema();
  await withStore<undefined>("readwrite", (store) => store.put(safeSnapshot, storageKey(userId)));
}

/** Subscribe after hydration and coalesce bursts of cache updates into one write. */
export function startUserQueryCachePersistence(queryClient: QueryClient, userId: string) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return;
    if (event.action.type !== "success" && event.action.type !== "setState") return;
    if (!isPersistableQuery(event.query)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!disposed) void writeUserSnapshot(queryClient, userId);
    }, PERSIST_DEBOUNCE_MS);
  });

  return () => {
    disposed = true;
    if (timer) clearTimeout(timer);
    timer = null;
    unsubscribe();
  };
}

