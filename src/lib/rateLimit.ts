const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now - entry.lastReset > WINDOW_MS) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}
