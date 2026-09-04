# Tollbooth

**A publisher paywall priced for AI crawlers.** x402 over Algorand TestNet.

Publishers today have two options for AI crawlers: block them, or negotiate an
enterprise contract. There is nothing in between, so almost everyone blocks.

Tollbooth is the middle: every article serves a **free preview** to anyone, and the
**full text costs $0.001**, paid inline over HTTP 402. No signup, no API key, no
contract. A crawler discovers the price in the 402 response, decides whether the
article is worth a tenth of a cent, and pays.

Built on the [x402 Commerce Template](https://github.com/) for the Algorand x402 challenge.

## What the demo shows

A research agent is given a question and **one cent**. It reads 40 free previews,
appraises them, and buys only what looks worth paying for — then answers using
nothing but the text it actually purchased. Because a cent only buys ten articles
and roughly a dozen are relevant, **the budget binds**: the agent has to rank, not
just filter. That is a market forming, live, on one screen.

## Why Algorand

At $0.001 per article, Ethereum gas turns every sale into a loss. Here the publisher
keeps the cent. Settlement finalises in ~3 seconds, so payment fits *inside* the HTTP
request rather than stalling it, and the facilitator sponsors the fee — the crawler
needs almost no ALGO of its own.

## Run it

```bash
pnpm install
pnpm wallet        # creates + opts in both wallets, tells you what to fund
pnpm dev           # publisher + dashboard on http://localhost:3100
pnpm warm          # optional but do it — precomputes ranking + answer
pnpm agent         # in a second terminal — the crawler goes shopping
```

A verified run: **10 articles bought for exactly $0.0100**, ten real USDC settlements
on Algorand TestNet, and an answer citing eight of the ten sources it paid for.

`pnpm wallet` is the gate. It generates two TestNet wallets — the agent that pays and
The Meridian that gets paid — opts both into USDC, and refuses to pass until each is
funded. Both sides must be opted in; a receiver that has not opted in makes settlement
fail in a way that is unpleasant to diagnose live.

Optional: set **`GEMINI_API_KEY`** (free tier — https://aistudio.google.com/apikey) or
`ANTHROPIC_API_KEY` to have a model rank the previews and write the final answer.
Check it with `pnpm probe:llm`, which lists the models your key can actually reach.

Appraisal degrades in three steps, so nothing here is a single point of failure:

1. **The model.** Gemini scores 12/12 of the top twelve correctly and zeroes all 28 decoys.
2. **The cache.** A successful ranking is written to `.rank-cache.json` and replayed in
   0.0s. Rehearse once and the demo cannot be broken by free-tier congestion — Gemini
   returns `503 "experiencing high demand"` often enough to matter. `FORCE_RANK=1` reruns it.
3. **Keywords.** A stemmed term-overlap ranker with no network at all. Visibly worse —
   it buys one irrelevant article and misses four good ones — but the demo still runs.

## Routes

| Route | Cost | What it is |
|---|---|---|
| `GET /feed` | free | The index. Appraisal has to be free or no market forms. |
| `GET /api/article/:id` | **$0.001** | Full text. Unpaid callers get title, date and a 220-char preview. |
| `GET /events` | free | SSE — settlements and agent decisions, for the dashboard. |
| `GET /` | free | The dashboard. Buyer on the left, seller on the right. |

## The thing worth stealing

The free preview lives in the **402 response itself**, via `unpaidResponseBody`. A
buyer appraises the goods inside the payment-required response and then decides. That
is the difference between a wall and a price tag, and it is what makes a *market*
rather than a toll.

## Gotchas that cost us time

- **Do not upgrade `@x402/*` past 2.19.0.** In 2.25.0 `ALGORAND_TESTNET_CAIP2` is
  truncated to 32 chars, while the deployed GoPlausible facilitator advertises the full
  genesis hash. The mismatch fails at startup with *"Facilitator does not support
  scheme exact on network ..."*. Check with `curl https://facilitator.goplausible.xyz/supported`.
- **Both payer and receiver must opt into the USDC ASA.** Otherwise the facilitator
  returns `isValid: false, "asset 10458941 missing from <addr>"` and the resource
  server answers a bare `402` with no explanation. `pnpm wallet` handles both.
- **Diagnose payments with `pnpm probe:pay`.** It asks the facilitator to verify a real
  payload and prints the actual reason, instead of the silent 402 the middleware returns.
- **Circle's TestNet USDC faucet limits per address, per 2 hours.** `pnpm wallet` will
  take USDC in *either* wallet and move it to the agent, so a rate-limited address is
  not a dead end. https://testnet.folks.finance/faucet is a second source.
