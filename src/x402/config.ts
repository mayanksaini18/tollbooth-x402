import { ExactAvmScheme } from '@x402/avm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import type { ResourceServerExtension } from '@x402/core/types';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { bazaarResourceServerExtension, declareDiscoveryExtension } from '@x402-avm/extensions';
import type { RuntimeConfig } from '../config.js';
import { byId, previewOf } from '../corpus.js';
import { emit, earnings } from '../events.js';
import { PUBLISHER_NAME } from '../routes/articles.js';

export const ARTICLE_DESCRIPTION =
  'Full text of one article from The Meridian archive. The preview is free; the body is priced per read.';

const idFromPath = (path: string) => decodeURIComponent(path.split('/').pop() ?? '');

export function createX402Middleware(config: RuntimeConfig) {
  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const server = new x402ResourceServer(facilitator);
  server.register(config.network, new ExactAvmScheme());
  server.registerExtension(bazaarResourceServerExtension as unknown as ResourceServerExtension);

  server.onAfterSettle(async ctx => {
    if (!ctx.result.success) return;
    // PaymentRequirements carries no resource url; the request path rides on the
    // transport context, and that is what identifies the article that just sold.
    const tc = ctx.transportContext as { request?: { path?: string } } | undefined;
    const id = idFromPath(tc?.request?.path ?? '');
    const article = byId.get(id);
    const txid = String(ctx.result.transaction ?? '');
    const payer = String(ctx.result.payer ?? '');

    earnings.total += Number(String(config.price).replace('$', ''));
    earnings.sales.unshift({ id, title: article?.title ?? id, txid, payer });
    emit({
      type: 'sale',
      side: 'publisher',
      id,
      title: article?.title ?? id,
      price: config.price,
      txid,
      payer,
      explorer: `https://lora.algokit.io/testnet/transaction/${txid}`,
      total: earnings.total,
    });
  });

  server.onSettleFailure(async ctx => {
    const why = ctx.error?.message ?? String(ctx.error);
    console.error(`  settle failed — ${why}`);
    emit({ type: 'failed', side: 'publisher', stage: 'settle', reason: why });
  });

  const discovery = declareDiscoveryExtension({
    input: { id: 'mp-blood' },
    inputSchema: {
      properties: {
        id: { type: 'string', description: 'Article id, as listed in the free /feed index' },
      },
      required: ['id'],
    },
    output: {
      example: {
        id: 'mp-blood',
        title: 'Microplastic particles found in 80% of human blood samples in Dutch cohort',
        date: '2026-08-14',
        section: 'Health',
        body: 'Researchers analysing blood from 312 healthy adults detected polymer particles...',
      },
    },
  });

  return paymentMiddleware(
    {
      'GET /api/article/:id': {
        accepts: [
          {
            scheme: 'exact',
            price: config.price,
            network: config.network,
            payTo: config.payTo,
            extra: {
              asset: config.usdcAssetId,
              ...(config.challengeMode ? { tag: 'x402-global-challenge' } : {}),
            },
          },
        ],
        description: ARTICLE_DESCRIPTION,
        mimeType: 'application/json',
        serviceName: PUBLISHER_NAME,
        /**
         * The appraisal surface. An unpaid caller still gets title, date and a
         * 220-character preview — enough to judge whether the body is worth a
         * tenth of a cent. This is the difference between a wall and a price tag.
         */
        unpaidResponseBody: (ctx: { path: string }) => {
          const a = byId.get(idFromPath(ctx.path));
          if (!a) {
            return {
              contentType: 'application/json',
              body: { error: 'not_found', message: 'No such article.' },
            };
          }
          return {
            contentType: 'application/json',
            body: {
              id: a.id,
              title: a.title,
              date: a.date,
              section: a.section,
              preview: previewOf(a),
              words: a.body.split(/\s+/).length,
              price: config.price,
              note: 'Preview is free. Pay to read the full text.',
            },
          };
        },
        settlementFailedResponseBody: (_ctx: unknown, r: Record<string, unknown>) => ({
          contentType: 'application/json',
          body: {
            error: 'payment_rejected',
            reason: r?.errorReason ?? 'unknown',
            detail: r?.errorMessage ?? '',
          },
        }),
        extensions: discovery,
      },
    },
    server,
  );
}
