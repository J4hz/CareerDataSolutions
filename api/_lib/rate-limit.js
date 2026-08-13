// ─────────────────────────────────────────────────────────────
// Per-IP rate limiting for the public API routes.
//
// WHY A STORE IS NEEDED AT ALL
// Serverless functions share no memory: Vercel runs many instances and
// recycles them, so a counter in a module-level Map is per-instance and
// resets whenever an instance is cold. It catches a naive burst that
// happens to land on one warm instance and nothing else. Real limiting
// needs somewhere outside the function to keep the count.
//
// WHICH STORE
// This talks the Upstash Redis REST protocol over plain fetch — no SDK, no
// new dependency. Vercel KV speaks that same protocol, so ONE
// implementation covers both of the options that were on the table; which
// one is in use is decided entirely by which environment variables exist:
//
//   KV_REST_API_URL + KV_REST_API_TOKEN            Vercel KV
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   Upstash direct
//
// With NEITHER set it degrades to the in-memory counter described above and
// logs a warning once. That is deliberately not silent: it is partial
// protection, and the deploy should not look limited when it is not.
//
// FAILURE MODE: OPEN
// If the store is unreachable or errors, the request is ALLOWED. A Redis
// outage must not take the order form down with it. The alternative — fail
// closed — turns a cache blip into lost sales.
//
// ALGORITHM
// Sliding window, approximated with two adjacent fixed windows weighted by
// how far into the current one we are. This is the standard trick: it costs
// two counters instead of a sorted set of timestamps, and it does not have
// the edge a plain fixed window does, where 2x the limit gets through by
// straddling a boundary.
// ─────────────────────────────────────────────────────────────

const store = (() => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
})();

let warned = false;
const memory = new Map();

/** One pipelined round trip: bump this window's counter, read the previous. */
async function counts(currentKey, previousKey, ttlSeconds) {
  if (!store) {
    if (!warned) {
      warned = true;
      console.warn(
        '[rate-limit] No KV_REST_API_* or UPSTASH_REDIS_REST_* configured. ' +
          'Falling back to per-instance in-memory counters, which do NOT ' +
          'limit reliably across serverless instances.'
      );
    }
    const now = Date.now();
    for (const [key, entry] of memory) if (entry.expires <= now) memory.delete(key);

    const entry = memory.get(currentKey) ?? { hits: 0, expires: now + ttlSeconds * 1000 };
    entry.hits += 1;
    memory.set(currentKey, entry);
    return { current: entry.hits, previous: memory.get(previousKey)?.hits ?? 0 };
  }

  const res = await fetch(`${store.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${store.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', currentKey],
      // NX so the window keeps its original expiry instead of sliding
      // forward on every hit, which would let a steady stream keep it alive.
      ['EXPIRE', currentKey, String(ttlSeconds), 'NX'],
      ['GET', previousKey],
    ]),
  });

  if (!res.ok) throw new Error(`store responded ${res.status}`);
  const [incr, , prev] = await res.json();
  return { current: Number(incr?.result ?? 0), previous: Number(prev?.result ?? 0) };
}

/**
 * @param {string} bucket   names the limit, so /api/order and /api/promo
 *                          count separately for the same visitor
 * @param {string} ip
 * @param {{limit: number, windowSeconds: number}} opts
 * @returns {Promise<{ok: boolean, retryAfter: number, remaining: number}>}
 */
export async function rateLimit(bucket, ip, { limit, windowSeconds }) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const index = Math.floor(now / windowMs);
  const elapsed = (now % windowMs) / windowMs;

  try {
    const { current, previous } = await counts(
      `rl:${bucket}:${ip}:${index}`,
      `rl:${bucket}:${ip}:${index - 1}`,
      // Outlive the window so the previous counter is still readable.
      windowSeconds * 2
    );

    const estimated = previous * (1 - elapsed) + current;
    const ok = estimated <= limit;

    return {
      ok,
      remaining: Math.max(0, Math.floor(limit - estimated)),
      retryAfter: ok ? 0 : Math.ceil((1 - elapsed) * windowSeconds),
    };
  } catch (err) {
    console.error('[rate-limit] store unavailable, allowing request:', err.message);
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}

/**
 * The caller's IP. On Vercel x-forwarded-for is set by the platform and its
 * FIRST entry is the real client; later entries are proxies. Anything a
 * client sends itself is appended after that, so it cannot spoof position
 * one. Falls back to the socket address when running outside Vercel.
 */
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] ?? req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Applies a limit and writes the 429 itself if it trips. Returns true when
 * the handler should stop.
 *
 *   if (await limited(req, res, 'order', { limit: 5, windowSeconds: 600 })) return;
 */
export async function limited(req, res, bucket, opts) {
  const { ok, retryAfter, remaining } = await rateLimit(bucket, clientIp(req), opts);

  res.setHeader('X-RateLimit-Limit', String(opts.limit));
  res.setHeader('X-RateLimit-Remaining', String(remaining));

  if (ok) return false;

  res.setHeader('Retry-After', String(retryAfter));
  res.status(429).json({
    error: 'Too many requests. Please wait a moment and try again.',
  });
  return true;
}
