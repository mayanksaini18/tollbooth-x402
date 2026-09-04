# x402 Commerce Template Demo Guide

Prepare `.env`, two funded/opted-in TestNet wallets, and dependencies before the demo. Set `DEMO_MODE=true` and keep one terminal running `pnpm dev`. Open `http://localhost:3000` for the visual walkthrough. The suggested timings are optional and can be adapted to your presentation.

## 00–05 — Why x402?

**Presenter note:** HTTP already has a status code for payment, but historically lacked a native payment proof. x402 standardizes the challenge and paid retry.

**Run:**

```bash
curl http://localhost:3000/health
```

**Observe:** Ordinary JSON and HTTP `200`.

**Key point:** x402 is per-resource HTTP payment, not login or subscription.

**Common failure:** Server is not running or `.env` lacks `PAY_TO_ADDRESS`.

## 05–10 — Architecture

**Presenter note:** The client, resource server, facilitator, and blockchain have distinct jobs. The Indexer data path is separate from payment settlement.

**Run:** Open [ARCHITECTURE.md](ARCHITECTURE.md).

**Observe:** The two branches from x402 Commerce Template.

**Key point:** The merchant server holds no receiving-wallet private key.

**Common failure:** Treating the Indexer as the facilitator.

## 10–18 — Normal x402 Commerce Template API

**Presenter note:** The default paid route's business logic is deterministic public-data mapping. Participants can replace it after the x402 lifecycle is verified.

**Run:**

```bash
pnpm test -- test/algorand.test.ts
curl -i http://localhost:3000/api/wallet/not-an-address
```

**Observe:** The default mapping test passes; invalid input returns `400` before payment.

**Key point:** Validate requests before charging.

**Common failure:** Using a syntactically invalid or wrong-network resource input.

## 18–30 — Add x402 Middleware

**Presenter note:** Walk through `src/x402/config.ts`: scheme, price, network, asset, `payTo`, facilitator, description, and extensions.

**Run:**

```bash
pnpm build
```

**Observe:** Typed configuration compiles.

**Key point:** The route handler contains no payment code; middleware owns the protocol.

**Common failure:** Upgrading SDK packages independently and breaking facilitator/network compatibility.

## 30–37 — Demonstrate HTTP 402

**Presenter note:** This client intentionally has no signer.

**Run:**

```bash
pnpm client:unpaid
```

**Observe:** `402`, `$0.001`, Algorand TestNet network reference, and asset `10458941`.

**Key point:** Payment terms are machine-readable.

**Common failure:** `WALLET_ADDRESS` or `PAY_TO_ADDRESS` is missing/invalid.

## 37–47 — Make a Paid Request

**Presenter note:** The official fetch wrapper challenges, constructs, signs, retries, verifies, and settles.

**Run:**

```bash
pnpm client:paid
```

Or select **Ask agent to buy** in the browser to show the same lifecycle as a visible five-step timeline.

**Observe:** Payer address, confirmed settlement receipt, transaction ID, and paid JSON.

**Key point:** Success is printed only after `PAYMENT-RESPONSE.success` is true.

**Common failure:** Payer or receiver not opted into USDC; payer lacks ALGO/USDC.

## 47–52 — Verify Algorand Settlement

**Presenter note:** Protocol output should be independently inspectable on-chain.

**Run:** Open the printed Pera TestNet Explorer URL.

**Observe:** Confirmed transaction and correct asset transfer to `payTo`.

**Key point:** Verification says a payment is valid; settlement says it happened.

**Common failure:** Opening MainNet explorer for a TestNet transaction.

## 52–56 — Bazaar Discovery

**Presenter note:** x402 pays; Bazaar discovers. Metadata is transported in the payment exchange and indexed from settlement traffic.

**Run:**

```bash
AGENT_DISCOVERY=bazaar pnpm client:agent
```

**Observe:** A real match is purchased, or the client truthfully says x402 Commerce Template is not indexed.

**Key point:** A local metadata declaration is not a live catalog entry.

**Common failure:** Expecting `localhost` to be a reliably callable public agent resource.

## 56–59 — Leaderboard / Challenge

**Presenter note:** TestNet validates mechanics; the current Challenge requires MainNet, public HTTPS, real GoPlausible settlement, discovery, tag, and tracked usage.

**Run:** Open [CHALLENGE_DEPLOYMENT.md](CHALLENGE_DEPLOYMENT.md).

**Observe:** The stepwise readiness checklist.

**Key point:** Local success is necessary but not leaderboard eligibility.

**Common failure:** Turning on the tag while still using TestNet and assuming that counts.

## 59–60 — Agentic Commerce Takeaway

**Presenter note:** An API became a paid API, then a discoverable economic service that an agent can purchase without an account.

**Run:**

```bash
AGENT_DISCOVERY=direct pnpm client:agent
```

**Observe:** The client labels known-resource mode and performs the same verified purchase lifecycle.

**Key point:** Autonomy comes from discovery + policy + payment + machine-readable output.

**Common failure:** Calling a hardcoded URL “discovery.” This client explicitly does not.
