/**
 * Appraisal. Given a question and 40 free previews, decide what is worth buying.
 *
 * One batched model call ranks everything at once — no per-article stall on stage,
 * and the whole ranking can be cached so a re-run survives dead conference wifi.
 * If there's no API key, or the call fails, keyword scoring takes over. The demo
 * must never hard-stop because an LLM had a bad moment in front of an audience.
 */
import Anthropic from "@anthropic-ai/sdk";

export interface Candidate { id: string; title: string; preview: string; section: string; date: string }
export interface Ranked { id: string; score: number; reason: string }

const STOP = new Set("the a an of in on for to and or is are was were with from by at as that this it its about how what why does did can could we you they actually know".split(" "));

/** Crude stemmer. Without it "microplastics" misses "microplastic" and the fallback scores nothing. */
const stem = (w: string) =>
  w.replace(/(ies)$/, "y").replace(/(sses|shes|ches|xes)$/, "s").replace(/([^s])s$/, "$1");

const terms = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)).map(stem);

/** Fallback: stemmed term overlap between the question and title+preview. Crude but never fails. */
export function keywordRank(question: string, items: Candidate[]): Ranked[] {
  const q = new Set(terms(question));
  return items
    .map((it) => {
      // Title terms count double — a match in the headline is a stronger signal.
      const hay = [...terms(it.title), ...terms(it.title), ...terms(it.preview)];
      const matched = new Set(hay.filter((w) => q.has(w)));
      const hits = hay.filter((w) => q.has(w)).length;
      const score = Math.min(10, (matched.size / Math.max(1, q.size)) * 11 + Math.min(2.5, hits * 0.25));
      return {
        id: it.id,
        score: Number(score.toFixed(1)),
        reason: matched.size ? `matches ${[...matched].slice(0, 3).join(", ")}` : "no overlap",
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function rankPreviews(question: string, items: Candidate[]): Promise<{ ranked: Ranked[]; by: "model" | "keywords" }> {
  if (!process.env.ANTHROPIC_API_KEY) return { ranked: keywordRank(question, items), by: "keywords" };

  const catalogue = items
    .map((it) => `<a id="${it.id}" section="${it.section}" date="${it.date}">\n${it.title}\n${it.preview}\n</a>`)
    .join("\n\n");

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 8000,
      output_config: { effort: "low" },
      system:
        "You appraise article previews for a research agent working under a strict budget. " +
        "Each purchase costs real money, so be decisive: score 0 for anything off-topic. " +
        "Reply with JSON only — no prose, no code fences.",
      messages: [
        {
          role: "user",
          content:
            `Question: ${question}\n\n` +
            `Score each article 0-10 for how much its FULL TEXT would help answer that question, ` +
            `judging only from the preview. Most of these are unrelated news — score those 0.\n\n` +
            `${catalogue}\n\n` +
            `Return: {"rankings":[{"id":"...","score":N,"reason":"under 12 words"}]}`,
        },
      ],
    });

    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as { rankings: Ranked[] };
    if (!Array.isArray(parsed.rankings) || parsed.rankings.length === 0) throw new Error("empty rankings");

    const known = new Set(items.map((i) => i.id));
    const ranked = parsed.rankings
      .filter((r) => known.has(r.id))
      .map((r) => ({ id: r.id, score: Number(r.score) || 0, reason: String(r.reason ?? "") }))
      .sort((a, b) => b.score - a.score);

    return ranked.length ? { ranked, by: "model" } : { ranked: keywordRank(question, items), by: "keywords" };
  } catch (err) {
    console.warn(`  ranking model unavailable (${(err as Error).message}) — falling back to keywords`);
    return { ranked: keywordRank(question, items), by: "keywords" };
  }
}
