import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { ARTICLES, previewOf } from '../src/corpus.js';
import { testConfig } from './config.js';

/** Stub the facilitator handshake so the middleware can start without network. */
function stubFacilitator() {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async input => {
      const url = String(input);
      if (url.endsWith('/supported')) {
        return Response.json({
          kinds: [
            {
              x402Version: 2,
              scheme: 'exact',
              network: testConfig.network,
              extra: { feePayer: testConfig.payTo },
            },
          ],
          extensions: [],
          signers: { 'algorand:*': [testConfig.payTo] },
        });
      }
      throw new Error(`Unexpected facilitator request: ${url}`);
    }),
  );
}

describe('Tollbooth', () => {
  beforeEach(stubFacilitator);

  it('keeps the health route public', async () => {
    const response = await createApp(testConfig).request('/health');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok', service: 'tollbooth' });
  });

  it('serves the whole index for free, because appraisal must cost nothing', async () => {
    const response = await createApp(testConfig).request('/feed');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { count: number; articles: Array<{ preview: string }> };
    expect(body.count).toBe(ARTICLES.length);
    expect(body.articles).toHaveLength(ARTICLES.length);
    expect(body.articles.every(a => a.preview.length > 0)).toBe(true);
  });

  it('charges for an article and returns the preview inside the 402', async () => {
    const article = ARTICLES[0]!;
    const response = await createApp(testConfig).request(`/api/article/${article.id}`);

    expect(response.status).toBe(402);

    // The preview rides in the 402 body — this is what lets a buyer appraise
    // before paying, and it is the difference between a wall and a price tag.
    const body = (await response.json()) as { title: string; preview: string; price: string };
    expect(body.title).toBe(article.title);
    expect(body.preview).toBe(previewOf(article));
    expect(body.price).toBe(testConfig.price);
    expect(JSON.stringify(body)).not.toContain(article.body.slice(-40));
  });

  it('advertises price, asset and network in the payment challenge', async () => {
    const response = await createApp(testConfig).request(`/api/article/${ARTICLES[0]!.id}`);
    const encoded = response.headers.get('payment-required');
    expect(encoded).toBeTruthy();

    const required = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8')) as {
      accepts: Array<{ amount: string; asset: string; network: string; payTo: string }>;
    };
    const [accepts] = required.accepts;
    expect(accepts?.network).toBe(testConfig.network);
    expect(accepts?.asset).toBe(testConfig.usdcAssetId);
    expect(accepts?.payTo).toBe(testConfig.payTo);
    expect(accepts?.amount).toBe('1000'); // $0.001 in atomic USDC units
  });

  it('rejects an unknown article before charging for it', async () => {
    const response = await createApp(testConfig).request('/api/article/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.headers.get('payment-required')).toBeNull();
  });

  it('serves the dashboard without leaking template escapes into its script', async () => {
    const response = await createApp(testConfig).request('/');
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('<title>Tollbooth');
    expect(html).not.toContain('\\${');
  });
});
