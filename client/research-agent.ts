/**
 * A research agent with a wallet and a spending limit.
 *
 *   pnpm agent "your question here"
 *
 * It reads the free index, appraises 40 previews, buys only what looks worth a
 * tenth of a cent, and answers using nothing but the text it actually paid for.
 * Every purchase is a real USDC settlement on Algorand TestNet.
 */
import 'dotenv/config';
import { createAvmPayingClient } from '../src/x402/client.js';
import { explainPaymentError } from './lib.js';
import * as cache from './cache.js';
import { activeProvider, complete } from './llm.js';
import { rankPreviews, type Candidate } from './rank.js';

const QUESTION =
  process.argv.slice(2).join(' ').trim() ||
  'What do we actually know about the health effects of microplastics in humans?';

/**
 * Any non-zero relevance signal makes an article a candidate. The real filter is the
 * budget: candidates are bought in rank order until the money runs out. That keeps the
 * behaviour identical whether the model or the keyword fallback did the appraising.
 */
const WORTH_BUYING = 0.5;

const BASE = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const BUDGET = Number(process.env.AGENT_BUDGET_USD ?? 0.01);
const money = (n: number) => `$${n.toFixed(4)}`;
const explorer = (tx: string) => `https://lora.algokit.io/testnet/transaction/${tx}`;

async function say(e: Record<string, unknown>) {
  try {
    await fetch(`${BASE}/agent-event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(e),
    });
  } catch {
    /* the dashboard is optional; the demo continues without it */
  }
}

async function main() {
  const mnemonic = process.env.CLIENT_MNEMONIC?.trim();
  if (!mnemonic) throw new Error('CLIENT_MNEMONIC is missing. Use a disposable TestNet wallet.');
  const payer = createAvmPayingClient(mnemonic, 'testnet');

  console.log(`\n  Question : ${QUESTION}`);
  console.log(`  Budget   : ${money(BUDGET)}`);
  console.log(`  Wallet   : ${payer.signer.address}\n`);
  await say({ type: 'start', question: QUESTION, budget: BUDGET, wallet: payer.signer.address });

  // 1. The index is free. Appraisal costs nothing.
  const feed = (await (await fetch(`${BASE}/feed`)).json()) as {
    publisher: string;
    price: string;
    articles: Array<Candidate & { url: string }>;
  };
  const candidates: Candidate[] = feed.articles.map(a => ({
    id: a.id, title: a.title, preview: a.preview, section: a.section, date: a.date,
  }));
  const unitPrice = Number(String(feed.price).replace('$', ''));
  // Money in integer micro-dollars: 0.009 + 0.001 > 0.01 is true in binary floating
  // point, which silently cost us the tenth purchase on the first live run.
  const unitMicro = Math.round(unitPrice * 1e6);
  const budgetMicro = Math.round(BUDGET * 1e6);
  console.log(`  Read ${candidates.length} free previews from ${feed.publisher} @ ${feed.price} each\n`);
  await say({ type: 'feed', count: candidates.length, publisher: feed.publisher, price: feed.price });

  // 2. Decide what is worth money.
  const { ranked, by } = await rankPreviews(QUESTION, candidates);
  const shortlist = ranked.filter(r => r.score >= WORTH_BUYING);
  console.log(`  Appraised by ${by}: ${shortlist.length} of ${candidates.length} worth buying\n`);
  await say({ type: 'ranked', by, considered: candidates.length, shortlisted: shortlist.length });

  for (const r of ranked.filter(r => r.score < WORTH_BUYING).slice(0, 12)) {
    const c = candidates.find(x => x.id === r.id)!;
    await say({ type: 'skipped', id: r.id, title: c.title, score: r.score, reason: r.reason });
  }

  // 3. Buy down the ranking until the money runs out.
  const bought: { title: string; body: string; txid: string }[] = [];
  let spentMicro = 0;
  let spent = 0;

  for (const r of shortlist) {
    if (spentMicro + unitMicro > budgetMicro) {
      console.log(`  Budget exhausted at ${money(spent)} — stopping.\n`);
      await say({ type: 'exhausted', spent });
      break;
    }
    const c = candidates.find(x => x.id === r.id)!;
    await say({ type: 'buying', id: r.id, title: c.title, score: r.score, reason: r.reason });

    try {
      const res = await payer.fetchWithPayment(`${BASE}/api/article/${r.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);

      const settlement = payer.httpClient.getPaymentSettleResponse(n => res.headers.get(n));
      if (!settlement.success) throw new Error(`settlement not confirmed: ${JSON.stringify(settlement)}`);

      const article = (await res.json()) as { title: string; body: string };
      const txid = String(settlement.transaction ?? '');
      spentMicro += unitMicro;
      spent = spentMicro / 1e6;
      bought.push({ title: article.title, body: article.body, txid });

      console.log(`  ✅ ${money(unitPrice)}  ${article.title.slice(0, 62)}`);
      console.log(`       ${explorer(txid)}`);
      await say({
        type: 'bought', id: r.id, title: article.title, score: r.score,
        txid, spent, explorer: explorer(txid),
      });
    } catch (err) {
      console.log(`  ❌ ${r.id}: ${explainPaymentError(err)}`);
      await say({ type: 'failed', id: r.id, error: (err as Error).message });
    }
  }

  console.log(`\n  Bought ${bought.length} articles for ${money(spent)} of ${money(BUDGET)}\n`);
  if (!bought.length) return;

  // 4. Answer using only what was paid for.
  if (activeProvider() === 'none') {
    console.log('  (No LLM key — skipping synthesis.) Purchased sources:');
    bought.forEach((b, i) => console.log(`  [${i + 1}] ${b.title}`));
    await say({ type: 'answer', answer: '(synthesis skipped — no API key)', sources: bought.map(b => b.title), spent });
    return;
  }

  await say({ type: 'synthesizing', sources: bought.length });
  const sources = bought.map((b, i) => `[${i + 1}] ${b.title}\n${b.body}`).join('\n\n');

  // The purchases already succeeded and are on chain. A congested model must not turn
  // a good run into a failed one, so synthesis degrades to the source list instead.
  const answerKey = cache.key('answer', QUESTION, bought.map(b => b.title).join('|'));
  let answer = cache.get<string>(answerKey) ?? '';
  try {
    if (!answer)
      answer = (
      await complete({
        maxTokens: 2000,
        system: 'Answer only from the supplied sources. Cite them inline as [1], [2]. Be concise — under 180 words.',
        prompt: `Question: ${QUESTION}\n\nSources:\n\n${sources}`,
      })
    ).trim();
    cache.set(answerKey, answer);
  } catch (err) {
    console.log(`  (synthesis unavailable: ${(err as Error).message})\n`);
    console.log('  Purchased sources:');
    bought.forEach((b, i) => console.log(`  [${i + 1}] ${b.title}`));
    console.log(`\n  Total cost: ${money(spent)}\n`);
    await say({ type: 'answer', answer: `(synthesis unavailable — ${(err as Error).message})`, sources: bought.map(b => b.title), spent });
    return;
  }

  console.log('  ── Answer ──────────────────────────────────────────\n');
  console.log(answer.split('\n').map(l => `  ${l}`).join('\n'));
  console.log('\n  ── Sources (all paid for) ──────────────────────────');
  bought.forEach((b, i) => console.log(`  [${i + 1}] ${b.title}`));
  console.log(`\n  Total cost of this answer: ${money(spent)}\n`);
  await say({ type: 'answer', answer, sources: bought.map(b => b.title), spent });
}

main().catch(error => {
  console.error(`\nAgent failed: ${explainPaymentError(error)}`);
  process.exit(1);
});
