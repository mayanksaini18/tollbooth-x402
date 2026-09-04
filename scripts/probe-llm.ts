/**
 * Checks the ranking/synthesis provider end to end.
 *
 *   pnpm exec tsx scripts/probe-llm.ts
 *
 * Lists the Gemini models the key can actually reach — model names drift, and
 * discovering a 404 during the demo is not the moment to find out.
 */
import 'dotenv/config';
import { activeProvider, complete } from '../client/llm.js';

const provider = activeProvider();
console.log(`\n  provider: ${provider}`);

if (provider === 'none') {
  console.log('\n  No key set. Add GEMINI_API_KEY (https://aistudio.google.com/apikey) or ANTHROPIC_API_KEY to .env.');
  console.log('  The demo still runs without one — appraisal falls back to keyword scoring.\n');
  process.exit(0);
}

if (provider === 'gemini') {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY!.trim() },
  });
  if (!res.ok) {
    console.error(`\n  Listing models failed: ${res.status} ${(await res.text()).slice(0, 200)}\n`);
    process.exit(1);
  }
  const body = (await res.json()) as {
    models?: Array<{ name: string; supportedGenerationMethods?: string[] }>;
  };
  const usable = (body.models ?? [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name.replace(/^models\//, ''))
    .filter(n => n.includes('flash') || n.includes('pro'));
  console.log(`  models reachable with this key (${usable.length}):`);
  for (const m of usable.slice(0, 15)) console.log(`    ${m}`);
  console.log('\n  Set GEMINI_MODEL in .env to pin one of these.');
}

process.stdout.write('\n  live call... ');
const answer = await complete({
  system: 'Reply with a single word.',
  prompt: 'Say OK.',
  maxTokens: 20,
});
console.log(`${answer.trim().slice(0, 40)}\n  ✅ provider works.\n`);
