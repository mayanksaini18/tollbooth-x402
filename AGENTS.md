# AGENTS.md

This repository is an x402 agentic commerce template for Algorand. Your job is to help the participant turn a short business idea into a working paid endpoint that can be called by agents.

## Default Goal

When the participant says what they want to build, implement it end to end:

1. Read `PROJECT_BRIEF.md`, `skills.md`, `README.md`, and the docs under `docs/resources/`.
2. Keep the payment lifecycle intact: unpaid request returns `402`, paid retry verifies through the facilitator, settlement occurs on Algorand, and only then the resource returns data.
3. Replace the default sample resource only where needed: route path, input validation, business logic, Bazaar metadata, dashboard labels, tests, and client target URL.
4. Keep secrets local. Never print or commit `.env`, mnemonics, private keys, API keys, or funded wallet credentials.
5. Verify with `pnpm build`, `pnpm test`, `pnpm smoke`, `pnpm simulate`, and at least one client flow when env vars are configured.

## x402 Invariants

- The protected route must be registered in `src/x402/config.ts`.
- Invalid input should be rejected before x402 middleware so users are not charged for malformed requests.
- `PAY_TO_ADDRESS` is the public receiver address only. The server does not need the receiver private key.
- `CLIENT_MNEMONIC` is only for local TestNet paying clients and the optional demo agent.
- `DEMO_MODE=true` is TestNet-only and must not be deployed with a production mnemonic.
- The paid client should treat a `200` response as complete only when the settlement receipt header reports success.
- Bazaar discovery metadata must describe the real resource, input schema, output shape, price, and use case. Do not leave placeholder metadata after customizing.

## Customization Checklist

- Rename the service in `package.json`, `README.md`, `src/server.ts`, and frontend text.
- Change the route from `/api/wallet/:address` if the participant is not selling the default wallet-data example.
- Update `src/routes/wallet.ts` or create a new route module for the participant's paid resource.
- Update `src/x402/config.ts` with the new protected route, resource description, input schema, output example, and Bazaar discovery metadata.
- Update `client/lib.ts` so clients call the new paid URL.
- Update `src/web/*` so the dashboard shows the participant's payment flow.
- Update tests in `test/` to cover the new route, 402 behavior, and invalid-input behavior.
- Keep `docs/resources/` accurate when adding new facilitator, Bazaar, client, or deployment patterns.

## How To Answer Participant Questions

Use local docs first:

- `docs/resources/X402_PRIMER.md` for protocol concepts.
- `docs/resources/ALGORAND_PAYMENT_REQUIREMENTS.md` for wallet, ALGO, USDC, TestNet, and MainNet setup.
- `docs/resources/GOPLAUSIBLE_FACILITATOR.md` for facilitator responsibilities.
- `docs/resources/BAZAAR_DISCOVERY.md` for discoverability.
- `docs/resources/AGENTIC_COMMERCE_PATTERNS.md` for paid service ideas.
- `docs/resources/TROUBLESHOOTING_PLAYBOOK.md` for debugging.

Use external docs only when local docs are insufficient or current deployment rules may have changed.

## Done Definition

A customized template is done when:

- `pnpm build` and `pnpm test` pass.
- `pnpm smoke` can reach `/health` and the protected route emits `402`.
- A paid TestNet request settles through GoPlausible.
- The dashboard demonstrates challenge, signing, retry, settlement, and receipt.
- `README.md` and `PROJECT_BRIEF.md` explain the participant's actual service.
- `.env.example` documents every required value without secrets.
