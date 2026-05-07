import { create } from "zustand";
import {
  Product,
  DirectCost,
  IndirectCost,
  PricingConfig,
  PricingResult,
} from "@/types/pricing";

interface PricingState {
  product?: Product;
  directCosts: DirectCost[];
  indirectCosts: IndirectCost[];
  config?: PricingConfig;
  result?: PricingResult;
}

interface PricingActions {
  setProduct: (p: Product) => void;
  addDirectCost: (c: DirectCost) => void;
  addIndirectCost: (c: IndirectCost) => void;
  setConfig: (c: PricingConfig) => void;
  setResult: (r: PricingResult) => void;
}

const usePricingStore = create<PricingState & PricingActions>((set) => ({
  directCosts: [],
  indirectCosts: [],

  setProduct: (product) => set({ product }),
  addDirectCost: (cost) =>
    set((s) => ({ directCosts: [...s.directCosts, cost] })),
  addIndirectCost: (cost) =>
    set((s) => ({ indirectCosts: [...s.indirectCosts, cost] })),
  setConfig: (config) => set({ config }),
  setResult: (result) => set({ result }),
}));

// State Hooks
export const useProduct = () => usePricingStore((s) => s.product);
export const useDirectCosts = () => usePricingStore((s) => s.directCosts);
export const useIndirectCosts = () => usePricingStore((s) => s.indirectCosts);
export const useConfig = () => usePricingStore((s) => s.config);
export const useResult = () => usePricingStore((s) => s.result);

// Action Hooks
export const useSetProduct = () => usePricingStore((s) => s.setProduct);
export const useAddDirectCost = () => usePricingStore((s) => s.addDirectCost);
export const useAddIndirectCost = () => usePricingStore((s) => s.addIndirectCost);
export const useSetConfig = () => usePricingStore((s) => s.setConfig);
export const useSetResult = () => usePricingStore((s) => s.setResult);
