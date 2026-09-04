import 'dotenv/config';
import algosdk from 'algosdk';

const A = process.argv[2]!;
console.log('valid address:', algosdk.isValidAddress(A));
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const i = (await algod.accountInformation(A).do()) as any;
console.log('ALGO:', Number(i.amount) / 1e6);
const assets = (i.assets ?? []).map((a: any) => ({ id: Number(a.assetId ?? a['asset-id']), amt: Number(a.amount) }));
console.log('assets:', JSON.stringify(assets));
const usdc = assets.find((a: any) => a.id === 10458941);
console.log('USDC (10458941):', usdc ? usdc.amt / 1e6 : 'NOT OPTED IN');
