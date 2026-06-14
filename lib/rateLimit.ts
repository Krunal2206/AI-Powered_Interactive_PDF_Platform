import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

class RateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

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

export const uploadLimiter = new RateLimiter({
  maxRequests: 5,
  windowSeconds: 600,
});

export const processLimiter = new RateLimiter({
  maxRequests: 5,
  windowSeconds: 600,
});

export const chatLimiter = new RateLimiter({
  maxRequests: 10,
  windowSeconds: 60,
});

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

  return null;
}
