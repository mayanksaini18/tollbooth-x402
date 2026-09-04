import 'dotenv/config';
import { rankPreviews } from '../client/rank.js';
import { ARTICLES, previewOf } from '../src/corpus.js';

const q = 'What do we actually know about the health effects of microplastics in humans?';
const items = ARTICLES.map(a => ({ id: a.id, title: a.title, preview: previewOf(a), section: a.section, date: a.date }));

const t0 = Date.now();
const { ranked, by } = await rankPreviews(q, items);
console.log(`\n  ranked by ${by} in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
for (const r of ranked.slice(0, 14)) {
  console.log(`  ${String(r.score).padStart(4)}  ${r.id.padEnd(12)} ${r.reason}`);
}
const relevant = ranked.slice(0, 12).filter(r => r.id.startsWith('mp-')).length;
console.log(`\n  ${relevant}/12 of the top 12 are genuinely relevant`);
console.log(`  shortlisted (score>0): ${ranked.filter(r => r.score > 0).length} of ${items.length}`);
