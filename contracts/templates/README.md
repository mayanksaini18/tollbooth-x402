# Smart Contract Templates

x402 exact payments do not require a custom application contract for the basic pay-per-request flow. The payment is an Algorand asset transfer verified and settled through the facilitator.

These templates are optional starting points for services that need additional on-chain logic around paid access.

## Included Templates

| Template | Use case |
| --- | --- |
| `escrowed-access.teal` | Hold funds until an external release condition is met |
| `usage-counter-approval.teal` | Record per-buyer usage count after a paid call |
| `subscription-note.md` | Design notes for turning per-request payments into renewable access |

## Rule

Do not add a smart contract unless the paid HTTP resource actually needs state, escrow, subscriptions, or programmable release conditions. Most starter projects should use the plain x402 payment route first.
