# Algorand Payment Requirements

For local development, use Algorand TestNet.

## TestNet Setup

You need two accounts:

- Payer: signs x402 payments from the client or local agent.
- Receiver: public `PAY_TO_ADDRESS` that receives USDC.

Both accounts need:

- Test ALGO for fees and minimum balance.
- Opt-in to TestNet USDC ASA `10458941`.

The payer also needs TestNet USDC.

## MainNet Setup

MainNet uses real value. Before switching:

- Disable `DEMO_MODE`.
- Use a production-safe signing path for buyers.
- Use the MainNet receiver address in `PAY_TO_ADDRESS`.
- Confirm the MainNet USDC ASA ID used by the SDK/config.
- Complete a real paid request and verify receiver balance.

## Useful Links

- Lora TestNet faucet: https://lora.algokit.io/testnet/fund
- Lora TestNet explorer/tools: https://lora.algokit.io/testnet
- Circle testnet faucet: https://faucet.circle.com/
- Pera TestNet explorer: https://testnet.explorer.perawallet.app/
- Pera MainNet explorer: https://explorer.perawallet.app/
