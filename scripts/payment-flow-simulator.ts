import 'dotenv/config';

const route = process.env.SIMULATOR_ROUTE ?? '/api/wallet/:address';
const price = process.env.PRICE_USDC ?? '$0.001';
const network = process.env.ALGORAND_NETWORK ?? 'testnet';
const facilitator = process.env.FACILITATOR_URL ?? 'https://facilitator.goplausible.xyz';
const payTo = process.env.PAY_TO_ADDRESS ?? '<PAY_TO_ADDRESS>';

const steps = [
  ['1', 'Client requests resource', `GET ${route}`],
  ['2', 'Server returns challenge', `HTTP 402, price ${price}, network ${network}, payTo ${payTo}`],
  ['3', 'Client evaluates policy', 'Check budget, network, asset, receiver, and resource metadata'],
  ['4', 'Client signs payment', 'Use local TestNet mnemonic, wallet integration, or production signer'],
  ['5', 'Client retries request', 'Same URL plus x402 payment proof header'],
  ['6', 'Server verifies payment', `POST verify through ${facilitator}`],
  ['7', 'Resource executes', 'Run paid business logic only after verification'],
  ['8', 'Facilitator settles', 'Submit USDC transfer on Algorand'],
  ['9', 'Server returns receipt', 'HTTP 200 plus settlement response header and JSON payload'],
] as const;

for (const [id, title, detail] of steps) {
  console.log(`${id}. ${title}`);
  console.log(`   ${detail}`);
}
