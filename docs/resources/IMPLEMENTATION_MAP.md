# Implementation Map

Use this map when a participant asks "where do I change the template?"

## Client Side

| Need | Files |
| --- | --- |
| Unpaid challenge demo | `client/unpaid-client.ts` |
| Paid buyer flow | `client/paid-client.ts` |
| Autonomous buyer flow | `client/agent-client.ts` |
| Shared buyer helpers | `client/lib.ts`, `sdk/extensions.ts` |
| Browser payment demo | `src/web/page.ts`, `src/web/app-script.ts`, `src/web/styles.ts` |

## Server Side

| Need | Files |
| --- | --- |
| App routes and middleware order | `src/app.ts` |
| Runtime env validation | `src/config.ts` |
| Paid business logic | `src/routes/wallet.ts` or a new route module |
| Local one-click demo agent | `src/routes/demo.ts` |
| Server start | `src/server.ts` |

## x402 And Facilitator

| Need | Files |
| --- | --- |
| Protected route registration | `src/x402/config.ts` |
| Price, network, asset, receiver | `.env`, `src/config.ts`, `src/x402/config.ts` |
| GoPlausible facilitator URL | `FACILITATOR_URL` |
| Client signer wiring | `src/x402/client.ts` |
| Payment inspection CLI | `scripts/x402-cli.ts` |

## Discovery

| Need | Files |
| --- | --- |
| Bazaar resource metadata | `src/x402/config.ts` |
| Programmatic discovery client | `client/agent-client.ts` |
| Discovery explanation | `docs/resources/BAZAAR_DISCOVERY.md` |

## Extras

| Component | Files |
| --- | --- |
| Smart contract templates | `contracts/templates/` |
| x402 CLI | `scripts/x402-cli.ts` |
| Agent testing sandbox | `scripts/agent-sandbox.ts` |
| Payment flow simulator | `scripts/payment-flow-simulator.ts` |
| SDK extensions | `sdk/extensions.ts` |

## Safe Customization Order

1. Update `PROJECT_BRIEF.md`.
2. Change paid resource logic.
3. Change route validation before x402.
4. Change `src/x402/config.ts`.
5. Change clients and dashboard.
6. Change tests.
7. Run build, tests, smoke, simulator, and paid TestNet flow.
