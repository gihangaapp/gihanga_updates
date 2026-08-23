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
}

class InMemoryRedis implements RedisLike {
  private sets = new Map<string, Set<string>>();
  private counters = new Map<string, number>();

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
    const had = this.sets.delete(key) || this.counters.delete(key);
    return had ? 1 : 0;
  }
  async incrby(key: string, amount: number) {
    const next = (this.counters.get(key) ?? 0) + amount;
    this.counters.set(key, next);
    return next;
  }
  async get(key: string) {
    return this.counters.has(key) ? String(this.counters.get(key)) : null;
  }
  async expire() {
    return 1; // no-op — the in-memory shim doesn't need TTLs to stay small at demo scale
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
