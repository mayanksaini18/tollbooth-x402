/**
 * Pre-computes and caches the closing answer, using exactly the articles the agent
 * would buy. Run this once before demoing so a congested model cannot take away the
 * line the whole demo builds to.
 */
import 'dotenv/config';
import * as cache from '../client/cache.js';
import { complete } from '../client/llm.js';
import { rankPreviews, type Ranked } from '../client/rank.js';
import { ARTICLES, byId, previewOf } from '../src/corpus.js';

const QUESTION =
  process.argv.slice(2).join(' ').trim() ||
  'What do we actually know about the health effects of microplastics in humans?';
const AFFORDABLE = Math.round(Number(process.env.AGENT_BUDGET_USD ?? 0.01) * 1e6) / 1000;

const items = ARTICLES.map(a => ({
  id: a.id, title: a.title, preview: previewOf(a), section: a.section, date: a.date,
}));
const { ranked, by } = await rankPreviews(QUESTION, items);
const bought = (ranked as Ranked[]).filter(r => r.score > 0).slice(0, AFFORDABLE).map(r => byId.get(r.id)!);

console.log(`\n  ranking by ${by}; would buy ${bought.length} articles`);
const answerKey = cache.key('answer', QUESTION, bought.map(b => b.title).join('|'));
if (cache.get<string>(answerKey)) {
  console.log('  answer already cached ✅\n');
  process.exit(0);
}

const sources = bought.map((b, i) => `[${i + 1}] ${b.title}\n${b.body}`).join('\n\n');
for (let attempt = 1; attempt <= 6; attempt++) {
  try {
    process.stdout.write(`  synthesis attempt ${attempt}... `);
    const answer = (
      await complete({
        maxTokens: 2000,
        system: 'Answer only from the supplied sources. Cite them inline as [1], [2]. Be concise — under 180 words.',
        prompt: `Question: ${QUESTION}\n\nSources:\n\n${sources}`,
      })
    ).trim();
    cache.set(answerKey, answer);
    console.log('ok\n');
    console.log(answer.split('\n').map(l => `  ${l}`).join('\n'));
    console.log('\n  cached ✅\n');
    process.exit(0);
  } catch (err) {
    console.log((err as Error).message);
    await new Promise(r => setTimeout(r, 8000));
  }
}
console.log('\n  Could not reach a model. The demo still runs; it will show the source list.\n');
