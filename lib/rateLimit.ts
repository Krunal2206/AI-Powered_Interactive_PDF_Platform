import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in seconds. */
  windowSeconds: number;
}

/**
 * Lightweight in-memory rate limiter keyed by user ID.
 *
 * This is a sliding-window counter that runs per-process. It works well for
 * single-instance deployments (Vercel serverless, single Node process, etc.).
 * For multi-instance production deployments, swap this out for a Redis-backed
 * limiter (e.g. @upstash/ratelimit).
 *
 * Stale entries are lazily evicted on each check to prevent unbounded growth.
 */
class RateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check whether `userId` is within the rate limit.
   *
   * @returns `{ allowed, remaining, resetInSeconds }`.
   */
  check(userId: string): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    this.evictStale(now);

    const entry = this.store.get(userId);

    if (!entry || now >= entry.resetTime) {
      // First request in a new window.
      this.store.set(userId, {
        count: 1,
        resetTime: now + this.config.windowSeconds * 1000,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetInSeconds: this.config.windowSeconds,
      };
    }

    if (entry.count < this.config.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Over the limit.
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  /** Remove expired entries to prevent the map from growing forever. */
  private evictStale(now: number) {
    // Only sweep every 100 checks to avoid O(n) on every request.
    if (this.store.size > 500) {
      for (const [key, entry] of this.store) {
        if (now >= entry.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }
}

// ── Pre-configured limiters for each route category ─────────────────────────

/** Upload: 5 uploads per 10 minutes per user. */
export const uploadLimiter = new RateLimiter({
  maxRequests: 5,
  windowSeconds: 600,
});

/**
 * Process (embedding generation): 5 requests per 10 minutes per user.
 * This is the most expensive operation (Pinecone + Google API).
 */
export const processLimiter = new RateLimiter({
  maxRequests: 5,
  windowSeconds: 600,
});

/** Chat: 20 messages per minute per user. */
export const chatLimiter = new RateLimiter({
  maxRequests: 20,
  windowSeconds: 60,
});

// ── Helper ──────────────────────────────────────────────────────────────────

/**
 * Apply a rate limiter and return a 429 response if the user has exceeded
 * their quota, or `null` if the request is allowed.
 *
 * Usage in a route handler:
 * ```ts
 * const blocked = applyRateLimit(uploadLimiter, userId);
 * if (blocked) return blocked;
 * ```
 */
export function applyRateLimit(
  limiter: RateLimiter,
  userId: string,
): NextResponse | null {
  const { allowed, resetInSeconds } = limiter.check(userId);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
        retryAfterSeconds: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetInSeconds),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetInSeconds),
        },
      },
    );
  }

  // Not blocked — caller continues normally.
  // We don't set headers here because NextResponse is created later by the route.
  return null;
}
