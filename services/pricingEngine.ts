import { DirectCost, IndirectCost, PricingConfig, PricingResult } from "@/types/pricing"

export function calculatePrice(
  directCosts: DirectCost[],
  indirectCosts: IndirectCost[],
  config: PricingConfig
): PricingResult {

  const totalDirectCost = directCosts.reduce((sum, c) => sum + c.costPerUnit, 0)

  const totalIndirectMonthly = indirectCosts.reduce((sum, c) => sum + c.monthlyValue, 0)
  const indirectPerUnit = totalIndirectMonthly / config.monthlyProduction

  const totalUnitCost = totalDirectCost + indirectPerUnit

  const priceWithMargin = totalUnitCost * (1 + config.marginPercent / 100)
  const finalPrice = priceWithMargin * (1 + config.taxPercent / 100)

  const profitPerUnit = finalPrice - totalUnitCost

  const breakEvenUnits = Math.ceil(totalIndirectMonthly / profitPerUnit)

  return {
    price: finalPrice,
    totalUnitCost,
    profitPerUnit,
    breakEvenUnits
  }
}