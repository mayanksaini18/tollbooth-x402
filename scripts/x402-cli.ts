import 'dotenv/config';
import { loadConfig } from '../src/config.js';

const command = process.argv[2] ?? 'help';

function printHelp() {
  console.log(`x402 template CLI

Commands:
  inspect      Print local payment configuration without secrets
  checklist   Print implementation readiness checks
  help        Show this message
`);
}

function inspect() {
  const config = loadConfig();
  console.log(JSON.stringify(
    {
      networkName: config.networkName,
      network: config.network,
      usdcAssetId: config.usdcAssetId,
      price: config.price,
      payTo: config.payTo,
      facilitatorUrl: config.facilitatorUrl,
      indexerUrl: config.indexerUrl,
      demoMode: config.demoMode,
      challengeMode: config.challengeMode,
      protectedRoute: 'GET /api/wallet/:address',
    },
    null,
    2,
  ));
}

function checklist() {
  const checks = [
    'PAY_TO_ADDRESS is a public receiver address, not a mnemonic.',
    'Payer and receiver are different accounts.',
    'Both TestNet accounts have ALGO for fees and minimum balance.',
    'Both TestNet accounts are opted into USDC ASA 10458941.',
    'Payer has TestNet USDC.',
    'Protected route is registered in src/x402/config.ts.',
    'Invalid input is rejected before payment middleware.',
    'Bazaar metadata describes the actual paid resource.',
    'Paid client checks settlement receipt before claiming success.',
  ];

  for (const check of checks) console.log(`- ${check}`);
}

if (command === 'inspect') inspect();
else if (command === 'checklist') checklist();
else printHelp();
