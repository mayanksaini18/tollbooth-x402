/**
 * The dashboard is plain HTML on disk rather than an embedded template literal —
 * its own client-side JS uses `${...}`, which cannot survive being nested inside a
 * TS template string without escaping that then leaks into the page.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function dashboardHtml(): string {
  for (const p of [join(here, 'dashboard.html'), join(process.cwd(), 'src/web/dashboard.html')]) {
    try {
      return readFileSync(p, 'utf8');
    } catch {
      /* try the next location — dist/ and src/ resolve differently */
    }
  }
  throw new Error('dashboard.html not found');
}
