import 'dotenv/config';
import { ARTICLES, previewOf } from '../src/corpus.js';

const key = process.env.GEMINI_API_KEY!.trim();
const model = process.env.GEMINI_MODEL!.trim();
const catalogue = ARTICLES.slice(0, 40)
  .map(a => `<a id="${a.id}">\n${a.title}\n${previewOf(a)}\n</a>`).join('\n\n');

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({
    system_instruction: { parts: [{ text: 'Reply with JSON only.' }] },
    contents: [{ role: 'user', parts: [{ text:
      `Question: health effects of microplastics in humans\n\nScore each 0-10.\n\n${catalogue}\n\nReturn {"rankings":[{"id":"...","score":N,"reason":"short"}]}` }] }],
    generationConfig: { maxOutputTokens: 8000, responseMimeType: 'application/json' },
  }),
});
const body: any = await res.json();
console.log('status:', res.status);
console.log('finishReason:', body.candidates?.[0]?.finishReason);
console.log('usage:', JSON.stringify(body.usageMetadata));
const text = body.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
console.log('text length:', text.length);
console.log('text head:', text.slice(0, 200));
console.log('text tail:', text.slice(-200));
