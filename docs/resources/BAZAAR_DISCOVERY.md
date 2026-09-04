# Bazaar Discovery

Bazaar is the discovery layer for paid x402 resources. It lets agents inspect what a paid endpoint does before paying.

## What To Configure

In `src/x402/config.ts`, set:

- Resource description.
- Protected route.
- Price.
- Network.
- USDC asset.
- Receiver address.
- Input example.
- Input JSON schema.
- Output example.
- Optional challenge or campaign tag.

## Discovery Readiness

Local metadata can be correct before Bazaar indexes anything. Public discovery usually requires:

1. Public HTTPS deployment.
2. GoPlausible facilitator.
3. Bazaar discovery extension enabled.
4. At least one successful paid settlement.
5. Resource visible in the GoPlausible catalog.

## Agent Policy

Agents should check:

- Does the route match the task?
- Is the price within budget?
- Is the network supported?
- Is the asset expected?
- Is the input schema satisfiable?
- Is the output useful enough to buy?

## Links

- Bazaar extension examples: https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/typescript/x402-avm-extensions-examples.md
- GoPlausible resource catalog: https://facilitator.goplausible.xyz/dashboard/leaderboards?cat=resources
