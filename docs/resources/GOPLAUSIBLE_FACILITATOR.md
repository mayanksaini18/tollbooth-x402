# GoPlausible Facilitator

The facilitator is the service the resource server uses to verify and settle x402 payments. This template defaults to:

```env
FACILITATOR_URL=https://facilitator.goplausible.xyz
```

## What It Does

- Advertises supported networks through facilitator support endpoints.
- Verifies that the payment payload matches the requested resource terms.
- Checks amount, asset, receiver, signature, expiry, and network.
- Settles the Algorand transaction.
- Returns a settlement receipt that clients can inspect.

## What It Does Not Do

- It does not make malformed inputs valid.
- It does not decide whether your API output is useful.
- It does not replace your input validation, tests, or buyer policy.
- It does not mean your service is discoverable until real settlement traffic is indexed.

## Local Checks

Run:

```bash
pnpm x402 inspect
pnpm client:unpaid
pnpm client:paid
```

If paid requests fail, inspect network, USDC opt-in, ALGO balance, payer/receiver separation, and facilitator URL.

## Links

- GoPlausible: https://goplausible.com/
- GoPlausible resource catalog: https://facilitator.goplausible.xyz/dashboard/leaderboards?cat=resources
- GoPlausible Algorand x402 documentation: https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/README.md
