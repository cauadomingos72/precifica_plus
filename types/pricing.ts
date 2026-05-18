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

export type TaxRegime = "simples" | "presumido" | "mei" | "outro"  // 👈 novo

// 👇 expandido para suportar regimes tributários
export type PricingConfig = {
  marginPercent: number
  monthlyProduction: number
  taxRegime: TaxRegime
  // Simples Nacional / MEI / Outro
  taxPercent?: number
  // Lucro Presumido — campos separados
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
}