# AI Agent Skills For This Template

Use this file as a compact operating manual for any coding agent working in this repository.

## Skill: Turn an idea into a paid x402 API

Input from participant:

```text
I want to build an agentic commerce service that sells <data/action/result> for <price> on Algorand using x402.
Inputs are <inputs>. Output is <JSON/result>. Buyers are <agents/users>.
```

Agent actions:

1. Fill or update `PROJECT_BRIEF.md`.
2. Define the paid route and input validation.
3. Implement the resource handler.
4. Register the route and payment terms in `src/x402/config.ts`.
5. Update Bazaar metadata with real examples.
6. Update clients and dashboard to call the route.
7. Add tests for invalid input, unpaid 402, and successful handler output.
8. Run build/test/simulator checks.

## Skill: Debug x402 payment failures

Check in this order:

1. Does `/health` return `200`?
2. Does an unpaid valid request return `402`?
3. Does the `payment-required` header include the expected scheme, network, amount, asset, and payTo?
4. Are payer and receiver different accounts?
5. Are both accounts funded with ALGO and opted into USDC?
6. Does the payer have enough USDC?
7. Does `FACILITATOR_URL` support the selected network?
8. Does the paid response include a successful settlement receipt?

## Skill: Prepare for public discovery

1. Deploy over HTTPS.
2. Set MainNet env vars only when the participant is ready for real payments.
3. Use the GoPlausible facilitator.
4. Keep Bazaar discovery enabled.
5. Complete a real paid request.
6. Verify the resource appears in the GoPlausible resource catalog.
7. Run `AGENT_DISCOVERY=bazaar pnpm client:agent`.

## Skill: Keep the project safe

- Never commit `.env`.
- Never log mnemonics.
- Never use a production mnemonic for local demos.
- Never enable `DEMO_MODE` on MainNet.
- Reject malformed inputs before the x402 middleware.
- Do not claim Bazaar discovery unless the service is actually indexed.
