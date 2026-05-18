/*import { createClient } from "@/lib/supabase/client"
import { DirectCost, IndirectCost, PricingConfig, PricingResult, Product } from "@/types/pricing"

export async function saveCalculation(
  product: Product,
  directCosts: DirectCost[],
  indirectCosts: IndirectCost[],
  config: PricingConfig,
  result: PricingResult
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("calculations").insert({
    user_id: user.id,
    product_name: product.name,
    product_category: product.category,
    product_unit: product.unit,
    direct_costs: directCosts,
    indirect_costs: indirectCosts,
    margin_percent: config.marginPercent,
    monthly_production: config.monthlyProduction,
    tax_regime: config.taxRegime,
    tax_percent: config.taxPercent,
    tax_pis: config.taxPis,
    tax_cofins: config.taxCofins,
    tax_iss: config.taxIss,
    tax_icms: config.taxIcms,
    result_price: result.price,
    result_unit_cost: result.totalUnitCost,
    result_profit_per_unit: result.profitPerUnit,
    result_breakeven_units: result.breakEvenUnits,
  })
}
*/