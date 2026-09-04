import 'dotenv/config';

const baseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const address = process.env.WALLET_ADDRESS ?? process.env.PAY_TO_ADDRESS;

if (!address) {
  console.error('Smoke check needs WALLET_ADDRESS or PAY_TO_ADDRESS in .env.');
  process.exit(1);
}

const health = await fetch(`${baseUrl}/health`);
if (!health.ok) throw new Error(`/health returned HTTP ${health.status}`);
console.log('✓ /health returned 200');

const wallet = await fetch(`${baseUrl}/api/wallet/${address}`);
if (wallet.status !== 402) throw new Error(`Protected route returned HTTP ${wallet.status}, expected 402`);
console.log('✓ protected paid endpoint returned 402 without payment');
