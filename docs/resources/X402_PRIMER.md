# x402 Primer

x402 uses the HTTP `402 Payment Required` status code to let software buy web resources without accounts, API keys, or a checkout page.

## Actors

| Actor | Responsibility |
| --- | --- |
| Client or agent | Requests a resource, reads payment terms, signs payment, retries |
| Resource server | Protects routes and serves data only after valid payment |
| Facilitator | Verifies payment payloads and settles on-chain |
| Algorand | Final settlement rail for USDC transfers |
| Bazaar | Discovery catalog for paid resources and machine-readable metadata |

## Lifecycle

1. Client sends an ordinary HTTP request.
2. Server returns `402` with payment requirements.
3. Client checks price, network, asset, receiver, expiry, and resource.
4. Client signs payment.
5. Client retries the same resource with payment proof.
6. Server asks the facilitator to verify.
7. Server executes the resource.
8. Facilitator settles the payment on Algorand.
9. Server returns the paid response and receipt.

## Engineering Rules

- Validate malformed inputs before the payment middleware.
- Never perform expensive work before payment verification.
- Treat the settlement receipt as the payment proof, not just HTTP `200`.
- Keep resource descriptions specific enough for agents to reason about cost and value.
- Keep the route deterministic where possible so buyers know what they are purchasing.

## Current Reference Links

- x402 docs: https://docs.x402.org/introduction
- Buyer quickstart: https://docs.x402.org/getting-started/quickstart-for-buyers
- Algorand x402 guide: https://dev.algorand.co/resources/x402-on-algorand/
- Algorand x402 developer hub: https://algorand.co/agentic-commerce/x402/developers
