import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Checks in-memory sliding window rate limit
 * @param key unique identifier (e.g. client IP + route)
 * @param limit max allowed requests in window (default 20)
 * @param windowMs window in milliseconds (default 60,000ms = 1 minute)
 */
export function checkRateLimit(key: string, limit = 20, windowMs = 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Validates request origin to protect sensitive API endpoints from CSRF
 */
export function validateOrigin(req: NextRequest): boolean {
  // Allow safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin) {
    // If no origin header, check referer header
    const referer = req.headers.get('referer');
    if (!referer) return true; // Internal or server-to-server
    try {
      const refUrl = new URL(referer);
      return refUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Extracts client IP safely from forwarded headers
 */
export function getClientIP(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIP = req.headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP.trim();
  }
  return '127.0.0.1';
}

/**
 * Sanitizes input strings against XSS / injection attacks
 */
export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[<>'"`;()]/g, '') // Strip script injection chars
    .slice(0, maxLength);
}

/**
 * Sanitizes numeric input (e.g. deposit amounts or logins)
 */
export function sanitizeAmount(val: unknown, min = 0.01, max = 1_000_000): number | null {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num) || num < min || num > max) {
    return null;
  }
  return Math.round(num * 100) / 100;
}
