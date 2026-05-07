"use client"

import { useEffect } from "react"
import { useDirectCosts, useIndirectCosts, useConfig, useResult, useSetResult } from "@/store/pricing.store"
import { calculatePrice } from "@/services/pricingEngine"
import Card from "@/components/Card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function ResultadoPage() {
  const directCosts = useDirectCosts()
  const indirectCosts = useIndirectCosts()
  const config = useConfig()
  const result = useResult()
  const setResult = useSetResult()

  useEffect(() => {
    if (!config) return

    const calc = calculatePrice(directCosts, indirectCosts, config)
    setResult(calc)
  }, [config, directCosts, indirectCosts, setResult])

  if (!result) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-xl font-medium animate-pulse">Calculando...</div>
    </div>
  )

  return (
    <main className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">Resultado da Precificação</Badge>
          <h2 className="text-xl font-semibold text-muted-foreground">💰 Preço sugerido</h2>
          <h1 className="text-5xl font-bold text-primary mt-2">
            R$ {result.price.toFixed(2)}
          </h1>
        </div>

        <Separator className="my-8" />

        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
            <span className="font-medium">Custo total por unidade:</span>
            <span className="text-lg font-semibold">R$ {result.totalUnitCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-lg">
            <span className="font-medium text-secondary-foreground">Lucro por unidade:</span>
            <span className="text-lg font-bold text-secondary">R$ {result.profitPerUnit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-accent/10 p-4 rounded-lg">
            <span className="font-medium text-accent-foreground">Ponto de equilíbrio:</span>
            <span className="text-lg font-bold text-accent">{result.breakEvenUnits} unidades</span>
          </div>
        </div>

        <div className="mt-10 p-4 border border-dashed rounded-lg bg-muted/10">
          <p className="text-sm text-center text-muted-foreground italic">
            * Este cálculo considera todos os custos diretos e a proporção dos custos indiretos com base na sua produção mensal.
          </p>
        </div>
      </Card>
    </main>
  )
}