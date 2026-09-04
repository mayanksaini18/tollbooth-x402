# Troubleshooting Playbook

## Fast Checks

```bash
pnpm build
pnpm test
pnpm smoke
pnpm simulate
pnpm x402 inspect
```

## Common Failures

| Symptom | Likely cause |
| --- | --- |
| Server will not start | Missing or invalid `PAY_TO_ADDRESS` |
| Unpaid request returns `400` | Input validation failed before x402 |
| Unpaid request returns `200` | Route is not protected by x402 middleware |
| Paid request fails before signing | Missing or invalid `CLIENT_MNEMONIC` |
| Facilitator rejects payment | Wrong network, asset, receiver, amount, or stale SDK/facilitator compatibility |
| Settlement fails | Payer lacks ALGO, USDC, or USDC opt-in |
| Bazaar discovery empty | Endpoint is not public/indexed or has no successful settlement traffic |

## Debug Order

1. Confirm `.env`.
2. Start `pnpm dev`.
3. Call `/health`.
4. Call the paid route without payment.
5. Inspect the `402` payment requirements.
6. Run a paid client.
7. Verify the transaction in Pera Explorer.
8. Check receiver USDC balance.
9. Check Bazaar only after public settlement.
