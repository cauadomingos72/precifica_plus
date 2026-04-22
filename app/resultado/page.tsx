"use client"

import { useEffect } from "react"
import { usePricingStore } from "@/store/pricing.store"
import { calculatePrice } from "@/services/pricingEngine"

export default function ResultadoPage() {
  const directCosts = usePricingStore((s) => s.directCosts)
  const indirectCosts = usePricingStore((s) => s.indirectCosts)
  const config = usePricingStore((s) => s.config)
  const result = usePricingStore((s) => s.result)
  const setResult = usePricingStore((s) => s.setResult)

  useEffect(() => {
    if (!config) return

    const calc = calculatePrice(directCosts, indirectCosts, config)
    setResult(calc)
  }, [])

  if (!result) return <div style={{padding:40}}>Calculando...</div>

  return (
    <div style={{ padding: 40 }}>
      <h1>Resultado da Precificação</h1>

      <h2>💰 Preço sugerido</h2>
      <h1>R$ {result.price.toFixed(2)}</h1>

      <hr /><br/>

      <p><strong>Custo total por unidade:</strong> R$ {result.totalUnitCost.toFixed(2)}</p>
      <p><strong>Lucro por unidade:</strong> R$ {result.profitPerUnit.toFixed(2)}</p>
      <p><strong>Ponto de equilíbrio:</strong> {result.breakEvenUnits} unidades</p>

    </div>
  )
}