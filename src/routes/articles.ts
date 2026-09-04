/**
 * The Meridian's two routes.
 *
 *   GET /feed            free  — the index every crawler is allowed to read
 *   GET /api/article/:id 402   — the full text, priced per read
 *
 * The paywall is deliberately porous: previews are free so a buyer can appraise
 * before spending. Blocking bots outright is what publishers do today; this
 * prices them instead.
 */
import type { Context } from 'hono';
import type { RuntimeConfig } from '../config.js';
import { ARTICLES, byId, previewOf } from '../corpus.js';

export const PUBLISHER_NAME = 'The Meridian';

export function createFeedHandler(config: RuntimeConfig) {
  return (c: Context) =>
    c.json({
      publisher: PUBLISHER_NAME,
      price: config.price,
      network: config.network,
      count: ARTICLES.length,
      articles: ARTICLES.map(a => ({
        id: a.id,
        title: a.title,
        date: a.date,
        section: a.section,
        preview: previewOf(a),
        price: config.price,
        url: `/api/article/${a.id}`,
      })),
    });
}

/** Only reachable once x402 has settled a payment for this article. */
export function createArticleHandler() {
  return (c: Context) => {
    const a = byId.get(String(c.req.param('id')));
    if (!a) return c.json({ error: 'not_found', message: 'No such article.' }, 404);
    return c.json({ id: a.id, title: a.title, date: a.date, section: a.section, body: a.body });
  };
}
