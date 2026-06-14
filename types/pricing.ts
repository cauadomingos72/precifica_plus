export type Product = {
  id: string
  name: string
  category: string
  unit: string
}

export type DirectCost = {
  id: string
  name: string
  costPerUnit: number
}

export type IndirectCost = {
  id: string
  name: string
  monthlyValue: number
}

export type TaxRegime = "simples" | "presumido" | "mei" | "outro"

export type PricingConfig = {
  marginPercent: number

  /**
   * Produção mensal deste produto específico.
   * Exemplo: 100 unidades de bolo de pote por mês.
   */
  monthlyProduction: number

  /**
   * Produção mensal total da empresa considerando o mix de produtos.
   * Exemplo: 100 bolos + 80 brownies + 50 tortas = 230 unidades/mês.
   *
   * Esse campo é usado para ratear custos indiretos como luz, água,
   * internet, aluguel, mão de obra administrativa etc.
   */
  totalMonthlyProduction: number

  taxRegime: TaxRegime

  // Simples Nacional / MEI / Outro
  taxPercent?: number

  // Lucro Presumido
  taxPis?: number
  taxCofins?: number
  taxIss?: number
  taxIcms?: number
}

export type PricingResult = {
  price: number
  totalUnitCost: number
  profitPerUnit: number
  breakEvenUnits: number

  /**
   * Custo direto unitário informado pelo usuário.
   */
  totalDirectCost: number

  /**
   * Custo indireto unitário rateado pelo mix total de produtos.
   */
  indirectCostPerUnit: number

  /**
   * Total mensal dos custos indiretos.
   */
  totalIndirectMonthly: number
}