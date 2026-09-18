/**
 * Redis-backed primitives (in-memory shim): idempotency keys, rate limiting
 * and the cross-instance sweeper lock. These back A5's "charges exactly
 * once" guarantee and A4's single-instance-safe sweeper.
 *
 * Run: npm run test:live
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { claimIdempotencyKey, rateLimitHits, redis } from "../src/lib/redis";

test("idempotency key: first claim wins, duplicate inside the window is a no-op", async () => {
  const key = `test-idem-${Math.random()}`;
  assert.equal(await claimIdempotencyKey("live:s1:like", key), true);
  assert.equal(await claimIdempotencyKey("live:s1:like", key), false);
  assert.equal(await claimIdempotencyKey("live:s1:like", key), false);
});

test("idempotency keys are scoped per stream and per interaction kind", async () => {
  const key = `test-scope-${Math.random()}`;
  assert.equal(await claimIdempotencyKey("live:s1:like", key), true);
  assert.equal(await claimIdempotencyKey("live:s1:comment", key), true); // different scope -> claimable
  assert.equal(await claimIdempotencyKey("live:s2:like", key), true);
});

test("sweeper lock: exactly one concurrent claimant holds the lock", async () => {
  await redis.del("live:sweeper:lock");
  assert.equal(await redis.setnx("live:sweeper:lock", "instance-a"), 1);
  assert.equal(await redis.setnx("live:sweeper:lock", "instance-b"), 0);
  assert.equal(await redis.setnx("live:sweeper:lock", "instance-c"), 0);
  await redis.del("live:sweeper:lock");
  assert.equal(await redis.setnx("live:sweeper:lock", "instance-b"), 1);
  await redis.del("live:sweeper:lock");
});

test("rate limiter allows up to the limit and blocks beyond it", async () => {
  const subject = `user-${Math.random()}`;
  const results: boolean[] = [];
  for (let i = 0; i < 5; i++) {
    results.push(await rateLimitHits("test-rl", subject, 3, 60));
  }
  assert.deepEqual(results, [true, true, true, false, false]);
});

test("in-memory redis honours TTL expiry for idempotency windows", async () => {
  const key = `test-ttl-${Math.random()}`;
  assert.equal(await redis.setnx(`idem:t:${key}`, "1"), 1);
  await redis.expire(`idem:t:${key}`, 0); // expire immediately
  // After expiry the key is gone -> a new claim succeeds (window elapsed).
  assert.equal(await redis.setnx(`idem:t:${key}`, "1"), 1);
  await redis.del(`idem:t:${key}`);
});
