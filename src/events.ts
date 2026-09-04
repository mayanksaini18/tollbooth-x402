/**
 * A tiny in-memory event bus behind an SSE endpoint. Both sides of the market —
 * the publisher settling payments and the agent narrating its decisions — write
 * here, so one screen can show the whole transaction.
 */
export interface MarketEvent {
  type: string;
  [key: string]: unknown;
}

const listeners = new Set<(e: MarketEvent) => void>();
const history: MarketEvent[] = [];

export const earnings = {
  total: 0,
  sales: [] as { id: string; title: string; txid: string; payer: string }[],
};

export function emit(event: MarketEvent): void {
  const stamped = { ...event, at: Date.now() };
  history.push(stamped);
  for (const l of listeners) l(stamped);
}

export function subscribe(fn: (e: MarketEvent) => void): () => void {
  for (const e of history) fn(e);
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function reset(): void {
  history.length = 0;
  earnings.total = 0;
  earnings.sales = [];
  emit({ type: 'reset' });
}
