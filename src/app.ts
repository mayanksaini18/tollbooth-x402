import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { RuntimeConfig } from './config.js';
import { byId } from './corpus.js';
import { earnings, emit, reset, subscribe, type MarketEvent } from './events.js';
import { askHandler } from './routes/ask.js';
import { createArticleHandler, createFeedHandler } from './routes/articles.js';
import { dashboardHtml } from './web/dashboard.js';
import { createX402Middleware } from './x402/config.js';

export interface AppOptions {
  fetchImpl?: typeof fetch;
}

export function createApp(config: RuntimeConfig, _options: AppOptions = {}) {
  const app = new Hono();

  app.get('/', c => c.html(dashboardHtml()));
  app.get('/health', c => c.json({ status: 'ok', service: 'tollbooth' }));

  // The free index. Appraisal must cost nothing, or the market cannot form.
  app.get('/feed', createFeedHandler(config));
  app.get('/earnings', c => c.json(earnings));

  // One screen showing both sides of the trade.
  app.get('/events', c =>
    streamSSE(c, async stream => {
      let open = true;
      const unsubscribe = subscribe((e: MarketEvent) => {
        if (open) void stream.writeSSE({ data: JSON.stringify(e) });
      });
      stream.onAbort(() => {
        open = false;
        unsubscribe();
      });
      // Hold the connection open until the client goes away.
      while (open) await stream.sleep(30_000);
    }),
  );

  // The agent narrates its own decisions here so buyer and seller share a screen.
  app.post('/agent-event', async c => {
    emit({ ...(await c.req.json<MarketEvent>()), side: 'agent' });
    return c.json({ ok: true });
  });
  app.post('/ask', askHandler);
  app.post('/reset', c => {
    reset();
    return c.json({ ok: true });
  });

  // Reject unknown ids before x402, so nobody is charged for an article we don't have.
  app.use('/api/article/:id', async (c, next) => {
    if (!byId.has(String(c.req.param('id')))) {
      return c.json({ error: 'not_found', message: 'No such article.' }, 404);
    }
    await next();
  });

  app.use(createX402Middleware(config));
  app.get('/api/article/:id', createArticleHandler());

  app.notFound(c => c.json({ error: 'not_found', message: 'Route not found.' }, 404));
  app.onError((error, c) => {
    console.error(error);
    const message = error.message.toLowerCase();
    if (
      message.includes('facilitator') ||
      message.includes('payment') ||
      message.includes('settle') ||
      message.includes('verify') ||
      message.includes('fetch')
    ) {
      return c.json(
        {
          error: 'payment_service_unavailable',
          message:
            'x402 payment processing is unavailable. Check FACILITATOR_URL, network compatibility, and facilitator status.',
        },
        503,
      );
    }
    return c.json({ error: 'internal_error', message: 'The paid resource could not complete the request.' }, 500);
  });

  return app;
}
