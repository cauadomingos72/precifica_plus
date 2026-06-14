import { createClient } from "@/lib/supabase/client"
import {
  DirectCost,
  IndirectCost,
  PricingConfig,
  PricingResult,
  Product,
} from "@/types/pricing"

export function getEffectiveTaxPercent(config: PricingConfig): number {
  if (config.taxRegime === "presumido") {
    return (
      (config.taxPis ?? 0) +
      (config.taxCofins ?? 0) +
      (config.taxIss ?? 0) +
      (config.taxIcms ?? 0)
    )
  }

  return config.taxPercent ?? 0
}

export async function saveCalculation(
  product: Product,
  directCosts: DirectCost[],
  indirectCosts: IndirectCost[],
  config: PricingConfig,
  result: PricingResult
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from("calculations").insert({
    user_id: user.id,

    product_name: product.name,
    product_category: product.category,
    product_unit: product.unit,

    direct_costs: directCosts,
    indirect_costs: indirectCosts,

    margin_percent: config.marginPercent,

    // Produção deste produto
    monthly_production: config.monthlyProduction,

    // Produção total do mix de produtos
    total_monthly_production: config.totalMonthlyProduction,

    tax_regime: config.taxRegime,
    tax_percent: config.taxPercent ?? null,
    tax_pis: config.taxPis ?? null,
    tax_cofins: config.taxCofins ?? null,
    tax_iss: config.taxIss ?? null,
    tax_icms: config.taxIcms ?? null,

    result_price: result.price,
    result_unit_cost: result.totalUnitCost,
    result_profit_per_unit: result.profitPerUnit,
    result_breakeven_units: result.breakEvenUnits,
  })
}