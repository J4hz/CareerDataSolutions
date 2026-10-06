// ─────────────────────────────────────────────────────────────
// Minimal Redis client over the Upstash REST protocol.
//
// Shared by api/_lib/rate-limit.js and api/_lib/orders.js so there is one
// place that knows how to reach the store. Plain fetch, no SDK, no new
// dependency. Vercel KV speaks the same protocol as Upstash, so which one is
// in use is decided entirely by which environment variables exist:
//
//   KV_REST_API_URL + KV_REST_API_TOKEN                 Vercel KV
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   Upstash direct
//
// With neither set, isConfigured() is false and the other functions throw.
// Callers are expected to check first and decide their own fallback — the
// rate limiter drops to in-memory counters, the order store to today's
// token-only behaviour. This file deliberately has no opinion on that.
//
// Errors (network, a non-2xx, or a Redis error on a single command) are
// thrown, never swallowed, for the same reason: only the caller knows whether
// a failure should fail open or closed.
//
// The env vars are read on each call rather than once at load. It costs
// nothing and means a test can point the module at a fake store.
// ─────────────────────────────────────────────────────────────

function config() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

export function isConfigured() {
  return config() !== null;
}

async function post(path, body) {
  const cfg = config();
  if (!cfg) throw new Error('KV is not configured');

  const res = await fetch(`${cfg.url}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`store responded ${res.status}`);
  return res.json();
}

/** One command, one round trip. → the command's `result`. */
async function command(args) {
  const body = await post('', args);
  if (body?.error) throw new Error(`store error: ${body.error}`);
  return body?.result ?? null;
}

/** Values go in as JSON, so an object comes back as the same object. Anything
 *  that does not parse (a counter written by INCR, say) is returned as is. */
function decode(raw) {
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** → the decoded value, or null if the key does not exist. */
export async function get(key) {
  return decode(await command(['GET', key]));
}

/**
 * Write a JSON-encoded value.
 *
 * `nx: true` only writes if the key does not exist yet, which makes this an
 * atomic "claim": of any number of concurrent callers, exactly one gets true.
 *
 * → true if the value was written, false if NX stopped it.
 */
export async function set(key, value, { ttlSeconds, nx = false } = {}) {
  const args = ['SET', key, JSON.stringify(value)];
  if (ttlSeconds) args.push('EX', String(ttlSeconds));
  if (nx) args.push('NX');
  // Redis answers "OK" when it wrote, and null when NX declined.
  return (await command(args)) === 'OK';
}

/** Remove a key. → true if it existed. */
export async function del(key) {
  return Number(await command(['DEL', key])) > 0;
}

/**
 * Several raw commands in one round trip, e.g. [['INCR', k], ['GET', k2]].
 *
 * Unlike get/set, nothing is encoded or decoded: this hands back Upstash's
 * own array of `{ result }` / `{ error }`, one per command, so the caller can
 * read counters and the like exactly as Redis returned them.
 */
export async function pipeline(commands) {
  return post('/pipeline', commands);
}
