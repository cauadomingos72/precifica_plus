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

export type PricingConfig = {
  taxPercent: number
  marginPercent: number
  monthlyProduction: number
}

export type PricingResult = {
  price: number
  totalUnitCost: number
  profitPerUnit: number
  breakEvenUnits: number
}