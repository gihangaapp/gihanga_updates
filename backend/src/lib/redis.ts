import Redis from "ioredis";

/**
 * Minimal interface we actually use — lets us swap in an in-memory shim
 * when REDIS_URL isn't configured, so local/dev setups without Redis still
 * work. Set REDIS_URL in .env to use real Redis (recommended in production —
 * the in-memory shim doesn't survive a restart and doesn't work across
 * multiple server instances).
 */
interface RedisLike {
  sadd(key: string, member: string): Promise<number>;
  srem(key: string, member: string): Promise<number>;
  scard(key: string): Promise<number>;
  smembers(key: string): Promise<string[]>;
  del(key: string): Promise<number>;
  incrby(key: string, amount: number): Promise<number>;
  get(key: string): Promise<string | null>;
  expire(key: string, seconds: number): Promise<number>;
  /** SET key value NX — returns 1 when the key was set, 0 when it existed. */
  setnx(key: string, value: string): Promise<number>;
}

class InMemoryRedis implements RedisLike {
  private sets = new Map<string, Set<string>>();
  private counters = new Map<string, number>();
  private strings = new Map<string, string>();
  private expiries = new Map<string, number>(); // key -> epoch ms when it should vanish

  private expired(key: string): boolean {
    const at = this.expiries.get(key);
    if (at === undefined) return false;
    if (Date.now() >= at) {
      this.expiries.delete(key);
      this.strings.delete(key);
      this.counters.delete(key);
      return true;
    }
    return false;
  }

  async sadd(key: string, member: string) {
    const set = this.sets.get(key) ?? new Set<string>();
    const added = set.has(member) ? 0 : 1;
    set.add(member);
    this.sets.set(key, set);
    return added;
  }
  async srem(key: string, member: string) {
    const set = this.sets.get(key);
    if (!set?.has(member)) return 0;
    set.delete(member);
    return 1;
  }
  async scard(key: string) {
    return this.sets.get(key)?.size ?? 0;
  }
  async smembers(key: string) {
    return Array.from(this.sets.get(key) ?? []);
  }
  async del(key: string) {
    const had = this.sets.delete(key) || this.counters.delete(key) || this.strings.delete(key);
    this.expiries.delete(key);
    return had ? 1 : 0;
  }
  async incrby(key: string, amount: number) {
    const next = (this.counters.get(key) ?? 0) + amount;
    this.counters.set(key, next);
    return next;
  }
  async get(key: string) {
    if (this.expired(key)) return null;
    if (this.strings.has(key)) return this.strings.get(key) ?? null;
    return this.counters.has(key) ? String(this.counters.get(key)) : null;
  }
  async expire(key: string, seconds: number) {
    // The shim honours TTLs for string/counter keys (idempotency windows,
    // sweeper locks, rate-limit buckets) — exactly the keys that need it.
    this.expiries.set(key, Date.now() + seconds * 1000);
    return 1;
  }
  async setnx(key: string, value: string) {
    if (this.expired(key)) {
      this.strings.delete(key);
      this.counters.delete(key);
    }
    if (this.strings.has(key) || this.counters.has(key)) return 0;
    this.strings.set(key, value);
    return 1;
  }
}

let client: RedisLike;

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL) as unknown as RedisLike;
  console.log("[Redis] Connected via REDIS_URL");
} else {
  client = new InMemoryRedis();
  console.log("[Redis] REDIS_URL not set — using in-memory fallback (fine for local dev, not for multi-instance prod)");
}

export const redis = client;

// ── Live viewer presence (per-stream set of connected socket ids) ──────────

export async function addLiveViewer(streamId: string, socketId: string) {
  await redis.sadd(`live:${streamId}:viewers`, socketId);
  return redis.scard(`live:${streamId}:viewers`);
}
export async function removeLiveViewer(streamId: string, socketId: string) {
  await redis.srem(`live:${streamId}:viewers`, socketId);
  return redis.scard(`live:${streamId}:viewers`);
}
export async function getLiveViewerCount(streamId: string) {
  return redis.scard(`live:${streamId}:viewers`);
}
export async function clearLiveViewers(streamId: string) {
  await redis.del(`live:${streamId}:viewers`);
}

// ── High-frequency reaction bursts (not persisted per-tap, just counted) ───

export async function incrLiveReactions(streamId: string, amount = 1) {
  return redis.incrby(`live:${streamId}:reactions`, amount);
}

// ── Idempotency & rate limiting for paid live interactions ──────────────────

/**
 * Claims an idempotency key for `idempotencyWindowSeconds`. Returns true when
 * THIS caller is the first to use the key (the charge may proceed); false when
 * a duplicate arrives inside the window (ignore it — the user was already
 * charged/credited for that action).
 */
export async function claimIdempotencyKey(
  scope: string,
  key: string,
  idempotencyWindowSeconds = 300,
): Promise<boolean> {
  const claimed = await redis.setnx(`idem:${scope}:${key}`, "1");
  if (claimed) await redis.expire(`idem:${scope}:${key}`, idempotencyWindowSeconds);
  return claimed === 1;
}

/**
 * Sliding-window-ish rate limit: allows at most `limit` hits per
 * `windowSeconds` for one subject. Returns true when the hit is allowed.
 */
export async function rateLimitHits(
  scope: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const bucketKey = `rl:${scope}:${subject}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  const hits = await redis.incrby(bucketKey, 1);
  if (hits === 1) await redis.expire(bucketKey, windowSeconds + 5);
  return hits <= limit;
}
