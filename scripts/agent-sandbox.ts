import 'dotenv/config';
import { createPayingClient, readPaymentRequired, resourceUrl } from '../client/lib.js';
import { assertBuyerPolicy } from '../sdk/extensions.js';

async function main() {
  const url = resourceUrl();
  const maxUsd = Number(process.env.AGENT_MAX_USD ?? '0.01');

  console.log(`Sandbox agent evaluating ${url}`);
  const challenge = await fetch(url);
  if (challenge.status !== 402) {
    throw new Error(`Expected HTTP 402 before payment, received ${challenge.status}.`);
  }

  const requirement = readPaymentRequired(challenge);
  if (!requirement) {
    throw new Error('Could not parse payment requirements.');
  }

  assertBuyerPolicy(requirement, {
    maxUsd,
    allowedNetworks: [requirement.network],
  });

  console.log(`Policy accepted ${requirement.price} on ${requirement.network}.`);

  if (process.env.AGENT_SANDBOX_PAY !== 'true') {
    console.log('Dry run complete. Set AGENT_SANDBOX_PAY=true to perform the paid request.');
    return;
  }

  const payer = createPayingClient();
  const paid = await payer.fetchWithPayment(url);
  if (!paid.ok) {
    throw new Error(`Paid request failed with HTTP ${paid.status}: ${await paid.text()}`);
  }

  const settlement = payer.httpClient.getPaymentSettleResponse(name => paid.headers.get(name));
  if (!settlement.success) throw new Error('Paid response did not include a successful settlement receipt.');

  console.log(`Settlement confirmed: ${settlement.transaction}`);
  console.log(JSON.stringify(await paid.json(), null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
