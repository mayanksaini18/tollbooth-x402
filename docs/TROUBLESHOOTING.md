# Troubleshooting

## Endpoint Works but Is Not Visible

Treat each stage separately:

```text
configured → verified → settled → indexed/discoverable → leaderboard-visible
```

A local `402` proves configuration. It does not prove settlement, discovery, or Challenge eligibility.

### Visibility Checklist

- [ ] The resource URL is public and uses HTTPS, not `localhost`.
- [ ] `FACILITATOR_URL=https://facilitator.goplausible.xyz`.
- [ ] `ALGORAND_NETWORK` matches the payer, receiver, and asset.
- [ ] TestNet uses USDC ASA `10458941`; MainNet uses `31566704`.
- [ ] The `payTo` account exists on that network and is opted into USDC.
- [ ] `PAY_TO_ADDRESS` is the intended receiver, not accidentally the payer.
- [ ] The payer has enough ALGO for balance/fees and enough USDC.
- [ ] A payment actually verified and settled through GoPlausible.
- [ ] The paid client received a successful settlement receipt and transaction ID.
- [ ] The transaction is confirmed in the matching network explorer.
- [ ] USDC arrived in `payTo`.
- [ ] Bazaar discovery is registered and the route has valid description/input/output metadata.
- [ ] `CHALLENGE_MODE=true` adds `x402-global-challenge` for a Challenge deployment.
- [ ] The endpoint is on MainNet for Challenge leaderboard activity.
- [ ] The GoPlausible dashboard's Global Challenge filter is enabled when checking the Challenge.

TestNet is correct for demo validation but does not count toward the current Challenge leaderboard. See the [current Algorand readiness guide](https://algorand.co/blog/the-x402-global-challenge-is-live-how-to-build-submit-your-entry).

## Startup Fails

`PAY_TO_ADDRESS is required` means `.env` is missing or not loaded. Copy `.env.example` and use a public Algorand address.

`Facilitator does not support scheme` usually means a network identifier/package compatibility mismatch or the facilitator is not ready. Run:

```bash
curl https://facilitator.goplausible.xyz/supported
pnpm client:unpaid
```

x402 Commerce Template pins the last release tested against the currently advertised full Algorand network references. Do not casually upgrade only one `@x402/*` package.

## Invalid Address

A malformed address returns `400` before payment. A valid address that does not exist on the selected network can pass the x402 gate and later return `404`; clients should choose an address known on the selected network.

## Indexer Unavailable

A paid, verified request may still fail if the data provider is unreachable. Confirm `INDEXER_URL`, network selection, and connectivity. The default URLs are:

```text
https://testnet-idx.algonode.cloud
https://mainnet-idx.algonode.cloud
```

## Payer Mnemonic Is Invalid

`CLIENT_MNEMONIC` must be a 25-word Algorand mnemonic from a disposable demo payer account. Quoting it in `.env` avoids parsing surprises. Never paste it into logs, issues, commits, or deployed resource-server environment variables.

## Browser Says Demo Is Disabled

The visual purchase button calls a server-side demo agent. For local TestNet only, set:

```env
DEMO_MODE=true
```

Restart `pnpm dev` after changing `.env`. The route deliberately refuses MainNet, missing mnemonics, and configurations where payer equals `PAY_TO_ADDRESS`. The plain unpaid `402` demonstration works even when demo mode is off.

## Insufficient ALGO or USDC

The payer needs ALGO for fees and minimum balance plus USDC for the price. Both payer and receiver must opt into the relevant USDC ASA. Check holdings with Lora or the matching Pera explorer.

## Facilitator Unreachable or Verification Fails

Check `/supported`, verify the route advertises one of its scheme/network pairs, and inspect the exact paid-client error. Common causes are stale package versions, wrong network, wrong asset, invalid signature, expired payload, and a payer that cannot fund the transfer.

## Settlement Fails

Verification is not settlement. Confirm the paid client receives a `PAYMENT-RESPONSE` with `success: true`. If not, do not claim payment success. Check the payer's balance/opt-in, receiver opt-in, Algorand availability, and facilitator dashboard.

## Bazaar Metadata Is Present but Search Finds Nothing

Metadata in a local `402` means configured, not indexed. Use public HTTPS and complete settlement through the indexing facilitator. Allow for external indexing delay, then inspect the [resource catalog](https://facilitator.goplausible.xyz/dashboard/leaderboards?cat=resources).

## Local Success vs Challenge Success

| Observation | What it proves |
| --- | --- |
| `/health` returns 200 | Hono server runs |
| Unpaid route returns 402 | Payment gate is configured |
| Paid TestNet request returns 200 with receipt | Demo flow settled on TestNet |
| Resource appears in Bazaar | Facilitator indexed discovery metadata |
| MainNet activity appears under Challenge filter | Leaderboard tracking is working |
