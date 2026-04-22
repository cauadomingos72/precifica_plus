"use client"

import { useState } from "react"
import { usePricingStore } from "@/store/pricing.store"
import { useRouter } from "next/navigation"

export default function MargemPage() {
  const setConfig = usePricingStore((s) => s.setConfig)
  const router = useRouter()

  const [margin, setMargin] = useState(20)
  const [tax, setTax] = useState(10)
  const [production, setProduction] = useState(100)

  const continuar = () => {
    if (production <= 0) {
      alert("Produção deve ser maior que zero")
      return
    }

    setConfig({
      marginPercent: margin,
      taxPercent: tax,
      monthlyProduction: production
    })

    router.push("/resultado")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Margem, Impostos e Produção</h1>

      <p>Margem de lucro (%)</p>
      <input
        type="number"
        value={margin}
        onChange={(e) => setMargin(+e.target.value)}
      /><br/><br/>

      <p>Impostos (%)</p>
      <input
        type="number"
        value={tax}
        onChange={(e) => setTax(+e.target.value)}
      /><br/><br/>

      <p>Produção mensal (unidades)</p>
      <input
        type="number"
        value={production}
        onChange={(e) => setProduction(+e.target.value)}
      /><br/><br/>

      <button onClick={continuar}>
        Calcular preço →
      </button>
    </div>
  )
}