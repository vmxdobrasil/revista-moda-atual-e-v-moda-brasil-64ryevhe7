import pb from '@/lib/pocketbase/client'

export interface PricingRule {
  id: string
  format: string
  base_price: number
  reach_multiplier: { divisor: number; max_addition: number }
  position_multiplier: { premium: number; standard: number; bottom: number }
  active: boolean
  created: string
  updated: string
}

export async function getPricingRules(): Promise<PricingRule[]> {
  return (await pb.collection('ad_pricing_rules').getFullList({
    sort: 'format',
  })) as unknown as PricingRule[]
}

export async function updatePricingRule(
  id: string,
  data: Partial<PricingRule>,
): Promise<PricingRule> {
  return (await pb.collection('ad_pricing_rules').update(id, data)) as unknown as PricingRule
}
