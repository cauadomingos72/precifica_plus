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
  removeDirectCost: (id: string) => void;          
  updateDirectCost: (c: DirectCost) => void;         
  addIndirectCost: (c: IndirectCost) => void;
  removeIndirectCost: (id: string) => void;          
  updateIndirectCost: (c: IndirectCost) => void;     
  setConfig: (c: PricingConfig) => void;
  setResult: (r: PricingResult) => void;
}

const usePricingStore = create<PricingState & PricingActions>((set) => ({
  directCosts: [],
  indirectCosts: [],

  setProduct: (product) => set({ product }),

  addDirectCost: (cost) =>
    set((s) => ({ directCosts: [...s.directCosts, cost] })),
  removeDirectCost: (id) =>
    set((s) => ({ directCosts: s.directCosts.filter((c) => c.id !== id) })),
  updateDirectCost: (cost) =>
    set((s) => ({
      directCosts: s.directCosts.map((c) => (c.id === cost.id ? cost : c)),
    })),

  addIndirectCost: (cost) =>
    set((s) => ({ indirectCosts: [...s.indirectCosts, cost] })),
  removeIndirectCost: (id) =>
    set((s) => ({ indirectCosts: s.indirectCosts.filter((c) => c.id !== id) })),
  updateIndirectCost: (cost) =>
    set((s) => ({
      indirectCosts: s.indirectCosts.map((c) => (c.id === cost.id ? cost : c)),
    })),

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
export const useRemoveDirectCost = () => usePricingStore((s) => s.removeDirectCost);     // 👈 novo
export const useUpdateDirectCost = () => usePricingStore((s) => s.updateDirectCost);     // 👈 novo
export const useAddIndirectCost = () => usePricingStore((s) => s.addIndirectCost);
export const useRemoveIndirectCost = () => usePricingStore((s) => s.removeIndirectCost); // 👈 novo
export const useUpdateIndirectCost = () => usePricingStore((s) => s.updateIndirectCost); // 👈 novo
export const useSetConfig = () => usePricingStore((s) => s.setConfig);
export const useSetResult = () => usePricingStore((s) => s.setResult);