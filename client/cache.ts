/**
 * Stage insurance. Anything expensive or flaky gets written here on success and
 * replayed later, so a rehearsed demo cannot be broken by free-tier congestion.
 * Delete .demo-cache.json, or set FORCE_RANK=1, to force everything to rerun.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const FILE = '.demo-cache.json';

export const key = (...parts: string[]) =>
  createHash('sha256').update(parts.join(' ')).digest('hex').slice(0, 16);

export function get<T>(k: string): T | null {
  if (process.env.FORCE_RANK === '1' || !existsSync(FILE)) return null;
  try {
    return ((JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, T>)[k] ?? null) as T | null;
  } catch {
    return null;
  }
}

export function set<T>(k: string, value: T): void {
  try {
    const all = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, unknown>) : {};
    all[k] = value;
    writeFileSync(FILE, JSON.stringify(all, null, 2));
  } catch {
    /* caching is a convenience, never a requirement */
  }
}
