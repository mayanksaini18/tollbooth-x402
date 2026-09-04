/**
 * Hour-zero script. Creates the two TestNet wallets the demo needs, opts both into
 * USDC, and tells you exactly what still needs funding.
 *
 *   pnpm wallet
 *
 * Two wallets, because a market needs two sides: the agent pays, the publisher is
 * paid. Both must be opted into the USDC ASA — a receiver that has not opted in
 * makes settlement fail in a way that is painful to diagnose live.
 */
import 'dotenv/config';
import algosdk from 'algosdk';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { USDC_TESTNET_ASA_ID } from '@x402/avm';

const ENV = '.env';
const ASA = Number(USDC_TESTNET_ASA_ID);
const algod = new algosdk.Algodv2('', process.env.ALGOD_URL ?? 'https://testnet-api.algonode.cloud', '');

function upsert(key: string, value: string) {
  const raw = existsSync(ENV) ? readFileSync(ENV, 'utf8') : '';
  if (new RegExp(`^${key}=`, 'm').test(raw)) {
    writeFileSync(ENV, raw.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`));
  } else {
    appendFileSync(ENV, `${raw && !raw.endsWith('\n') ? '\n' : ''}${key}=${value}\n`);
  }
}

function ensureWallet(envKey: string, label: string): algosdk.Account {
  let mnemonic = process.env[envKey]?.trim();
  if (!mnemonic) {
    const acct = algosdk.generateAccount();
    mnemonic = algosdk.secretKeyToMnemonic(acct.sk);
    upsert(envKey, `"${mnemonic}"`);
    console.log(`  Generated a fresh ${label} wallet → ${envKey}`);
  }
  return algosdk.mnemonicToSecretKey(mnemonic);
}

interface Status { address: string; algo: number; optedIn: boolean; usdc: number }

async function inspect(address: string): Promise<Status> {
  const info = (await algod.accountInformation(address).do()) as unknown as {
    amount: bigint | number;
    assets?: Array<{ assetId?: bigint | number; 'asset-id'?: number; amount: bigint | number }>;
  };
  const held = (info.assets ?? []).find(a => Number(a.assetId ?? a['asset-id']) === ASA);
  return {
    address,
    algo: Number(info.amount ?? 0) / 1e6,
    optedIn: Boolean(held),
    usdc: held ? Number(held.amount ?? 0) / 1e6 : 0,
  };
}

/**
 * The agent needs very little ALGO — the facilitator sponsors transaction fees — so
 * surplus can seed the publisher's minimum balance. Saves a second faucet trip, which
 * matters when the clock is running.
 */
async function seed(from: algosdk.Account, to: string, algo: number) {
  const sp = await algod.getTransactionParams().do();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: from.addr.toString(),
    receiver: to,
    amount: Math.round(algo * 1e6),
    suggestedParams: sp,
  });
  const { txid } = await algod.sendRawTransaction(txn.signTxn(from.sk)).do();
  await algosdk.waitForConfirmation(algod, txid, 4);
  return txid;
}

async function optIn(acct: algosdk.Account) {
  const sp = await algod.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: acct.addr.toString(),
    receiver: acct.addr.toString(),
    amount: 0,
    assetIndex: ASA,
    suggestedParams: sp,
  });
  const { txid } = await algod.sendRawTransaction(txn.signTxn(acct.sk)).do();
  await algosdk.waitForConfirmation(algod, txid, 4);
  return txid;
}

const payer = ensureWallet('CLIENT_MNEMONIC', 'agent (payer)');
const publisher = ensureWallet('PUBLISHER_MNEMONIC', 'publisher (receiver)');
upsert('PAY_TO_ADDRESS', publisher.addr.toString());
upsert('WALLET_ADDRESS', publisher.addr.toString());

const blockers: string[] = [];

// If the publisher is short on ALGO and the agent has plenty, top it up locally.
const payerAlgo = (await inspect(payer.addr.toString())).algo;
const pubAlgo = (await inspect(publisher.addr.toString())).algo;
if (pubAlgo < 0.3 && payerAlgo > 1.5) {
  process.stdout.write(`  Seeding the publisher with 1 ALGO from the agent... `);
  console.log(await seed(payer, publisher.addr.toString(), 1));
}

for (const [label, acct] of [['agent  ', payer], ['meridian', publisher]] as const) {
  const s = await inspect(acct.addr.toString());
  console.log(`\n  ${label}  ${s.address}`);
  console.log(`            ALGO ${s.algo}   USDC ${s.optedIn ? s.usdc : 'not opted in'}`);

  if (s.algo < 0.2) {
    blockers.push(`Fund ${label.trim()} with TestNet ALGO → https://lora.algokit.io/testnet/fund\n     ${s.address}`);
    continue; // opt-in needs ALGO for the fee and minimum balance
  }
  if (!s.optedIn) {
    process.stdout.write('            opting into USDC... ');
    console.log(await optIn(acct));
  }
}

const payerAfter = await inspect(payer.addr.toString());
if (payerAfter.optedIn && payerAfter.usdc < 0.05) {
  blockers.push(`Fund the agent with TestNet USDC → https://faucet.circle.com (Algorand TestNet)\n     ${payerAfter.address}`);
}

if (blockers.length) {
  console.log('\n  Still needed:\n');
  blockers.forEach((b, i) => console.log(`  ${i + 1}. ${b}\n`));
  console.log('  Then re-run: pnpm wallet\n');
  process.exit(1);
}
console.log('\n  ✅ Both wallets funded and opted in. Run: pnpm dev\n');
