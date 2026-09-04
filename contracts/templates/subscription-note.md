# Subscription Template Notes

For subscription-like access, keep x402 as the payment entry point and store only the minimum on-chain state needed to answer:

- Who paid?
- What plan did they buy?
- When does access expire?
- Which resource does it unlock?

Recommended shape:

- `subscribe`: paid HTTP route receives x402 settlement, then writes or updates entitlement state.
- `check`: free or paid route reads entitlement state.
- `renew`: same as `subscribe`, extending the expiry.
- `revoke`: admin path for abuse or refund handling.

Avoid storing private user data on-chain. Store account IDs, plan IDs, timestamps, and hashes where possible.
