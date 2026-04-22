import { create } from "zustand"
import {
  Product,
  DirectCost,
  IndirectCost,
  PricingConfig,
  PricingResult
} from "@/types/pricing"

type Store = {
  product?: Product
  directCosts: DirectCost[]
  indirectCosts: IndirectCost[]
  config?: PricingConfig
  result?: PricingResult

  setProduct: (p: Product) => void
  addDirectCost: (c: DirectCost) => void
  addIndirectCost: (c: IndirectCost) => void
  setConfig: (c: PricingConfig) => void
  setResult: (r: PricingResult) => void
}

export const usePricingStore = create<Store>((set) => ({
  directCosts: [],
  indirectCosts: [],

  setProduct: (product) => set({ product }),
  addDirectCost: (cost) =>
    set((s) => ({ directCosts: [...s.directCosts, cost] })),
  addIndirectCost: (cost) =>
    set((s) => ({ indirectCosts: [...s.indirectCosts, cost] })),
  setConfig: (config) => set({ config }),
  setResult: (result) => set({ result })
}))