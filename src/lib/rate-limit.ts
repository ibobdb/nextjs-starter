import { NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitContext {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (Map)
const rateLimitMap = new Map<string, RateLimitContext>();

/**
 * Background interval to clean up expired entries
 * Prevents memory leaks in long-running node processes.
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, context] of rateLimitMap.entries()) {
      if (context.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Run cleanup every minute
}

/**
 * Core rate limit checker
 * @param identifier Unique key (e.g. user ID, IP address)
 * @param config Rate limit constraints
 */
export function rateLimit(
  identifier: string, 
  config: RateLimitConfig = { limit: 100, windowMs: 60000 }
) {
  const now = Date.now();
  let context = rateLimitMap.get(identifier);

  if (!context || context.resetTime < now) {
    // New window or expired previous window
    context = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  context.count++;
  rateLimitMap.set(identifier, context);

  const isAllowed = context.count <= config.limit;
  const remaining = Math.max(0, config.limit - context.count);

  return {
    isAllowed,
    limit: config.limit,
    remaining,
    resetTime: context.resetTime,
    // Pre-built nextjs response for convenience
    response: !isAllowed ? NextResponse.json(
      { 
        success: false, 
        error: 'Too Many Requests', 
        message: 'Rate limit exceeded, please try again later.' 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(context.resetTime).toISOString()
        }
      }
    ) : null
  };
}
