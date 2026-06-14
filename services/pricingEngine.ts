import {
  DirectCost,
  IndirectCost,
  PricingConfig,
  PricingResult,
} from "@/types/pricing"
import { getEffectiveTaxPercent } from "@/services/calculations"

export function calculatePrice(
  directCosts: DirectCost[],
  indirectCosts: IndirectCost[],
  config: PricingConfig
): PricingResult {
  const effectiveTaxPercent = getEffectiveTaxPercent(config)

  const totalDirectCost = directCosts.reduce(
    (sum, cost) => sum + Number(cost.costPerUnit ?? 0),
    0
  )

  const totalIndirectMonthly = indirectCosts.reduce(
    (sum, cost) => sum + Number(cost.monthlyValue ?? 0),
    0
  )

  /**
   * Aqui está a correção principal:
   *
   * Antes:
   * totalIndirectMonthly / config.monthlyProduction
   *
   * Problema:
   * Isso jogava todo o custo indireto mensal em cima de um único produto.
   *
   * Agora:
   * totalIndirectMonthly / config.totalMonthlyProduction
   *
   * Assim, luz, água, internet, aluguel etc. são rateados pelo mix total
   * de produtos da empresa.
   */
  const totalMonthlyProduction =
    config.totalMonthlyProduction > 0
      ? config.totalMonthlyProduction
      : config.monthlyProduction

  const indirectCostPerUnit =
    totalMonthlyProduction > 0
      ? totalIndirectMonthly / totalMonthlyProduction
      : 0

  const totalUnitCost = totalDirectCost + indirectCostPerUnit

  /**
   * Este cálculo aplica margem e imposto de forma simples.
   *
   * Exemplo:
   * Custo unitário: R$ 10,00
   * Margem: 30%
   * Imposto: 6%
   *
   * priceWithMargin = 10 * 1.30
   * finalPrice = 13 * 1.06
   */
  const priceWithMargin = totalUnitCost * (1 + config.marginPercent / 100)
  const finalPrice = priceWithMargin * (1 + effectiveTaxPercent / 100)

  const profitPerUnit = finalPrice - totalUnitCost

  /**
   * Ponto de equilíbrio aproximado:
   * Quantas unidades precisam ser vendidas para cobrir os custos indiretos.
   */
  const breakEvenUnits =
    profitPerUnit > 0
      ? Math.ceil(totalIndirectMonthly / profitPerUnit)
      : 0

  return {
    price: finalPrice,
    totalUnitCost,
    profitPerUnit,
    breakEvenUnits,
    totalDirectCost,
    indirectCostPerUnit,
    totalIndirectMonthly,
  }
}