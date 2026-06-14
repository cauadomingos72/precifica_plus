"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  useProduct,
  useDirectCosts,
  useIndirectCosts,
  useConfig,
  useResult,
  useSetResult,
} from "@/store/pricing.store"
import { calculatePrice } from "@/services/pricingEngine"
import { createClient } from "@/lib/supabase/client"
import Card from "@/components/Card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ResultadoPage() {
  const router = useRouter()
  const supabase = createClient()

  const product = useProduct()
  const directCosts = useDirectCosts()
  const indirectCosts = useIndirectCosts()
  const config = useConfig()
  const result = useResult()
  const setResult = useSetResult()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const hasSaved = useRef(false)

  useEffect(() => {
    const runCalculationAndSave = async () => {
      if (!product || !config) {
        router.push("/produtos")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const calc = calculatePrice(directCosts, indirectCosts, config)
      setResult(calc)

      if (hasSaved.current) return
      hasSaved.current = true

      setSaving(true)
      setSaveError(null)

      const { error } = await supabase.from("calculations").insert({
        user_id: user.id,

        product_name: product.name,
        product_category: product.category,
        product_unit: product.unit,

        direct_costs: directCosts,
        indirect_costs: indirectCosts,

        margin_percent: config.marginPercent,

        // Produção mensal deste produto específico
        monthly_production: config.monthlyProduction,

        // Produção mensal total da empresa/mix de produtos.
        // Este campo é usado para ratear custos indiretos como luz, água,
        // internet, aluguel e outros gastos compartilhados.
        total_monthly_production: config.totalMonthlyProduction,

        tax_regime: config.taxRegime,
        tax_percent: config.taxPercent ?? null,
        tax_pis: config.taxPis ?? null,
        tax_cofins: config.taxCofins ?? null,
        tax_iss: config.taxIss ?? null,
        tax_icms: config.taxIcms ?? null,

        result_price: calc.price,
        result_unit_cost: calc.totalUnitCost,
        result_profit_per_unit: calc.profitPerUnit,
        result_breakeven_units: calc.breakEvenUnits,
      })

      if (error) {
        console.error(error)
        setSaveError(
          "O cálculo foi realizado, mas não foi possível salvar no dashboard."
        )
        setSaving(false)
        return
      }

      setSaved(true)
      setSaving(false)
    }

    runCalculationAndSave()
  }, [
    product,
    config,
    directCosts,
    indirectCosts,
    setResult,
    router,
    supabase,
  ])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl font-medium animate-pulse">Calculando...</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            Resultado da Precificação
          </Badge>

          <h2 className="text-xl font-semibold text-muted-foreground">
            💰 Preço sugerido
          </h2>

          <h1 className="text-5xl font-bold text-primary mt-2">
            R$ {result.price.toFixed(2)}
          </h1>

          {product && (
            <p className="text-sm text-muted-foreground mt-3">
              Produto: {product.name}
            </p>
          )}
        </div>

        <Separator className="my-8" />

        <div className="space-y-6">
          {"totalDirectCost" in result && (
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <span className="font-medium">Custos diretos por unidade:</span>
              <span className="text-lg font-semibold">
                R$ {result.totalDirectCost.toFixed(2)}
              </span>
            </div>
          )}

          {"indirectCostPerUnit" in result && (
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <span className="font-medium">
                Custos indiretos rateados por unidade:
              </span>
              <span className="text-lg font-semibold">
                R$ {result.indirectCostPerUnit.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
            <span className="font-medium">Custo total por unidade:</span>
            <span className="text-lg font-semibold">
              R$ {result.totalUnitCost.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-lg">
            <span className="font-medium">Lucro por unidade:</span>
            <span className="text-lg font-bold text-secondary">
              R$ {result.profitPerUnit.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center bg-accent/10 p-4 rounded-lg">
            <span className="font-medium">Ponto de equilíbrio:</span>
            <span className="text-lg font-bold text-accent">
              {result.breakEvenUnits} unidades
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-primary">Rateio aplicado:</strong> os custos
            indiretos foram divididos pela produção mensal total da empresa/mix
            de produtos, não apenas pela produção deste produto.
          </p>

          {config && (
            <div className="mt-3 space-y-1">
              <p>
                Produção deste produto:{" "}
                <strong className="text-primary">
                  {config.monthlyProduction} unidades/mês
                </strong>
              </p>

              <p>
                Produção total da empresa:{" "}
                <strong className="text-primary">
                  {config.totalMonthlyProduction} unidades/mês
                </strong>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          {saving && (
            <p className="text-sm text-center text-muted-foreground">
              Salvando cálculo no dashboard...
            </p>
          )}

          {saved && (
            <p className="text-sm text-center text-green-600">
              Cálculo salvo no dashboard.
            </p>
          )}

          {saveError && (
            <p className="text-sm text-center text-red-600">{saveError}</p>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <Button className="flex-1" onClick={() => router.push("/dashboard")}>
            Ver dashboard
          </Button>

          <Button
            className="flex-1"
            variant="secondary"
            onClick={() => router.push("/produtos")}
          >
            Novo cálculo
          </Button>
        </div>

        <div className="mt-10 p-4 border border-dashed rounded-lg bg-muted/10">
          <p className="text-sm text-center text-muted-foreground italic">
            * Este cálculo considera custos diretos, impostos, margem desejada e
            o rateio dos custos indiretos com base na produção mensal total da
            empresa.
          </p>
        </div>
      </Card>
    </main>
  )
}