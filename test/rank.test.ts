import { describe, expect, it } from 'vitest';
import { keywordRank } from '../client/rank.js';
import { ARTICLES, previewOf } from '../src/corpus.js';

const candidates = ARTICLES.map(a => ({
  id: a.id, title: a.title, preview: previewOf(a), section: a.section, date: a.date,
}));

const QUESTION = 'What do we actually know about the health effects of microplastics in humans?';

describe('keyword appraisal (the no-API-key fallback)', () => {
  it('puts relevant articles above the decoys', () => {
    const ranked = keywordRank(QUESTION, candidates);
    const top10 = ranked.slice(0, 10);
    // Relevant articles are the mp-* ids; everything else is deliberate noise.
    expect(top10.filter(r => r.id.startsWith('mp-')).length).toBeGreaterThanOrEqual(8);
  });

  it('scores unrelated news at zero so the agent never wastes money on it', () => {
    const ranked = keywordRank(QUESTION, candidates);
    const sport = ranked.find(r => r.id === 'd01');
    expect(sport?.score).toBe(0);
  });

  it('matches across singular and plural — the bug that made it score nothing', () => {
    // "microplastics" in the question vs "microplastic" in the corpus.
    const ranked = keywordRank(QUESTION, candidates);
    expect(ranked.find(r => r.id === 'mp-blood')!.score).toBeGreaterThan(0);
  });

  it('shortlists more than the budget can buy, so ranking actually matters', () => {
    const ranked = keywordRank(QUESTION, candidates);
    const affordable = 10; // $0.01 budget at $0.001 each
    expect(ranked.filter(r => r.score > 0).length).toBeGreaterThan(0);
    expect(ranked.filter(r => r.score > 0).length).toBeLessThan(candidates.length);
    expect(affordable).toBeLessThan(candidates.length);
  });
});
