import type { PaymentRequiredSummary } from '../client/lib.js';

export interface BuyerPolicy {
  maxUsd: number;
  allowedNetworks: string[];
  allowedAssets?: string[];
}

export function parseUsdPrice(price: string): number {
  const normalized = price.trim().replace(/^\$/, '');
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid USD price: ${price}`);
  }
  return value;
}

export function assertBuyerPolicy(requirement: PaymentRequiredSummary, policy: BuyerPolicy) {
  const usd = parseUsdPrice(requirement.price);
  if (usd > policy.maxUsd) {
    throw new Error(`Price ${requirement.price} exceeds buyer limit $${policy.maxUsd}.`);
  }
  if (!policy.allowedNetworks.includes(requirement.network)) {
    throw new Error(`Network ${requirement.network} is not allowed by buyer policy.`);
  }
  if (policy.allowedAssets?.length && !policy.allowedAssets.includes(requirement.asset)) {
    throw new Error(`Asset ${requirement.asset} is not allowed by buyer policy.`);
  }
}

export function createResourceUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
