// lib/rate-limiter.ts
import { Logger } from '@/services/logger';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const activeLimits = new Map<string, RateLimitRecord>();

// Clean up expired limits in background every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    activeLimits.forEach((value, key) => {
      if (now > value.resetTime) {
        activeLimits.delete(key);
      }
    });
  }, 60000);
}

export class RateLimiter {
  /**
   * Simple client-IP rate limiter
   * @param ip Client IP Address
   * @param limit Maximum requests allowed in the window
   * @param windowMs Time window in milliseconds (default: 1 minute)
   * @returns boolean true if the request is within limits, false if rate limit is exceeded
   */
  static checkLimit(ip: string, limit: number, windowMs = 60000): { allowed: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const key = `ip:${ip}`;
    
    const record = activeLimits.get(key);

    if (!record) {
      const newRecord = { count: 1, resetTime: now + windowMs };
      activeLimits.set(key, newRecord);
      return { allowed: true, remaining: limit - 1, reset: newRecord.resetTime };
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return { allowed: true, remaining: limit - 1, reset: record.resetTime };
    }

    record.count += 1;

    if (record.count > limit) {
      Logger.warn(`Rate limit exceeded for IP: ${ip}. Request count: ${record.count}/${limit}`);
      return { allowed: false, remaining: 0, reset: record.resetTime };
    }

    return { allowed: true, remaining: limit - record.count, reset: record.resetTime };
  }
}
