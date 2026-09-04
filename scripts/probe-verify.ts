import 'dotenv/config';
import { createAvmPayingClient } from '../src/x402/client.js';

const url = `${process.env.API_BASE_URL ?? 'http://localhost:3100'}/api/article/mp-blood`;
const payer = createAvmPayingClient(process.env.CLIENT_MNEMONIC!.trim(), 'testnet');

const unpaid = await fetch(url);
const required = JSON.parse(
  Buffer.from(unpaid.headers.get('payment-required')!, 'base64url').toString('utf8'),
);
console.log('payer       :', payer.signer.address);
console.log('requirements:', JSON.stringify(required.accepts[0]));

try {
  const payload = await (payer.httpClient as any).client.createPaymentPayload(required);
  const res = await fetch('https://facilitator.goplausible.xyz/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ x402Version: 2, paymentPayload: payload, paymentRequirements: required.accepts[0] }),
  });
  console.log('\nfacilitator /verify →', res.status);
  console.log((await res.text()).slice(0, 600));
} catch (e) {
  console.log('\npayload creation threw:', (e as Error).message);
}
