/**
 * One small text-completion call, from whichever provider has a key.
 *
 * Order: Gemini (free tier) → Anthropic → neither, in which case callers fall back
 * to their own non-LLM path. Nothing in the payment flow depends on this file; it
 * only decides which articles look worth buying and writes the closing answer.
 *
 * Raw REST rather than an SDK: it is a single endpoint per provider, and a demo
 * running on conference wifi is better off with no extra dependency to resolve.
 */

export type Provider = 'gemini' | 'anthropic' | 'none';

export function activeProvider(): Provider {
  if (process.env.GEMINI_API_KEY?.trim()) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY?.trim()) return 'anthropic';
  return 'none';
}

export interface CompleteOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  /** Ask the provider for strict JSON instead of prose. */
  json?: boolean;
}

/** Model names drift; the first that answers wins. Override with GEMINI_MODEL. */
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL?.trim(),
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
].filter(Boolean) as string[];

async function gemini(o: CompleteOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY!.trim();
  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: o.system }] },
          contents: [{ role: 'user', parts: [{ text: o.prompt }] }],
          generationConfig: {
            maxOutputTokens: o.maxTokens ?? 8000,
            ...(o.json ? { responseMimeType: 'application/json' } : {}),
          },
        }),
      },
    );

    if (res.status === 404) {
      lastError = `model ${model} not available`;
      continue; // try the next known name
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const body = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = body.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? '';
    if (!text.trim()) throw new Error('Gemini returned an empty completion');
    return text;
  }
  throw new Error(lastError || 'no usable Gemini model');
}

async function anthropic(o: CompleteOptions): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const res = await new Anthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL?.trim() || 'claude-opus-5',
    max_tokens: o.maxTokens ?? 8000,
    system: o.system,
    messages: [{ role: 'user', content: o.prompt }],
  });
  return res.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

export async function complete(o: CompleteOptions): Promise<string> {
  switch (activeProvider()) {
    case 'gemini':
      return gemini(o);
    case 'anthropic':
      return anthropic(o);
    default:
      throw new Error('No LLM key set (GEMINI_API_KEY or ANTHROPIC_API_KEY).');
  }
}
