import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:upload",
});

export const processLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:process",
});

export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:chat",
});

export async function applyRateLimit(
  limiter: Ratelimit,
  userId: string,
): Promise<NextResponse | null> {
  const { success, reset } = await limiter.limit(userId);

  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);
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
