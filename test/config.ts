import type { RuntimeConfig } from '../src/config.js';

export const testConfig: RuntimeConfig = {
  port: 3000,
  networkName: 'testnet',
  network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
  usdcAssetId: '10458941',
  indexerUrl: 'https://example.test',
  facilitatorUrl: 'https://facilitator.example.test',
  payTo: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
  price: '$0.001',
  challengeMode: false,
  demoMode: false,
  defaultWalletAddress: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
};
