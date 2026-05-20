"use client"

import { useState } from "react"
import { useSetConfig } from "@/store/pricing.store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { TaxRegime } from "@/types/pricing"

// Opções de regime com descrição curta para o usuário
const TAX_REGIMES: { value: TaxRegime; label: string; description: string }[] = [
  {
    value: "simples",
    label: "Simples Nacional",
    description: "Alíquota unificada. A mais comum para MPEs.",
  },
  {
    value: "mei",
    label: "MEI",
    description: "Imposto fixo mensal (DAS). Informe 0 ou o % aproximado.",
  },
  {
    value: "presumido",
    label: "Lucro Presumido",
    description: "Tributos separados: PIS, COFINS, ISS ou ICMS.",
  },
  {
    value: "outro",
    label: "Outro / Não sei",
    description: "Informe o percentual total de impostos que você paga.",
  },
]

function LabelWithTooltip({
  htmlFor,
  label,
  tooltip,
}: {
  htmlFor: string
  label: string
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default function MargemPage() {
  const setConfig = useSetConfig()
  const router = useRouter()

  const [margin, setMargin] = useState(20)
  const [production, setProduction] = useState(100)
  const [regime, setRegime] = useState<TaxRegime>("simples")

  // Simples / MEI / Outro — alíquota única
  const [taxPercent, setTaxPercent] = useState(6)

  // Lucro Presumido — campos separados
  const [taxPis, setTaxPis] = useState(0.65)
  const [taxCofins, setTaxCofins] = useState(3)
  const [taxIss, setTaxIss] = useState(0)
  const [taxIcms, setTaxIcms] = useState(0)

  // Total de impostos calculado com base no regime
  const totalTax =
    regime === "presumido"
      ? taxPis + taxCofins + taxIss + taxIcms
      : taxPercent

  const continuar = () => {
    if (production <= 0) return

    setConfig({
      marginPercent: margin,
      monthlyProduction: production,
      taxRegime: regime,
      taxPercent: regime !== "presumido" ? taxPercent : undefined,
      taxPis: regime === "presumido" ? taxPis : undefined,
      taxCofins: regime === "presumido" ? taxCofins : undefined,
      taxIss: regime === "presumido" ? taxIss : undefined,
      taxIcms: regime === "presumido" ? taxIcms : undefined,
    })

    router.push("/resultado")
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">
          Margem, Impostos e Produção
        </h1>

        <div className="space-y-6">

          {/* Margem de lucro */}
          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="margin"
              label="Margem de lucro (%)"
              tooltip="Percentual de lucro desejado sobre o preço final. Ex: 30 significa que 30% do preço é lucro."
            />
            <Input
              id="margin"
              type="number"
              value={margin}
              onChange={(e) => setMargin(+e.target.value)}
            />
          </div>

          {/* Produção mensal */}
          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="production"
              label="Produção mensal (unidades)"
              tooltip="Quantas unidades você produz ou vende por mês. Usado para calcular o ponto de equilíbrio."
            />
            <Input
              id="production"
              type="number"
              value={production}
              onChange={(e) => setProduction(+e.target.value)}
            />
          </div>

          {/* Regime tributário */}
          <div className="space-y-3">
            <LabelWithTooltip
              htmlFor="regime"
              label="Regime tributário"
              tooltip="Define como sua empresa paga impostos. Se não souber, escolha 'Outro / Não sei' e informe o percentual total."
            />
            <div className="grid grid-cols-2 gap-2">
              {TAX_REGIMES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRegime(r.value)}
                  className={`
                    text-left rounded-lg border p-3 transition-colors
                    ${regime === r.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground"
                    }
                  `}
                >
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {r.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Campos de imposto — variam conforme regime */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Impostos
            </p>

            {regime === "presumido" ? (
              // Lucro Presumido — campos separados
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <LabelWithTooltip
                      htmlFor="pis"
                      label="PIS (%)"
                      tooltip="Geralmente 0,65% no regime cumulativo."
                    />
                    <Input
                      id="pis"
                      type="number"
                      step="0.01"
                      value={taxPis}
                      onChange={(e) => setTaxPis(+e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <LabelWithTooltip
                      htmlFor="cofins"
                      label="COFINS (%)"
                      tooltip="Geralmente 3% no regime cumulativo."
                    />
                    <Input
                      id="cofins"
                      type="number"
                      step="0.01"
                      value={taxCofins}
                      onChange={(e) => setTaxCofins(+e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <LabelWithTooltip
                      htmlFor="iss"
                      label="ISS (%) — serviços"
                      tooltip="Imposto sobre serviços. Varia de 2% a 5% conforme o município. Deixe 0 se vende produtos."
                    />
                    <Input
                      id="iss"
                      type="number"
                      step="0.01"
                      value={taxIss}
                      onChange={(e) => setTaxIss(+e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <LabelWithTooltip
                      htmlFor="icms"
                      label="ICMS (%) — produtos"
                      tooltip="Imposto sobre circulação de mercadorias. Varia de 7% a 25% conforme o estado. Deixe 0 se presta serviços."
                    />
                    <Input
                      id="icms"
                      type="number"
                      step="0.01"
                      value={taxIcms}
                      onChange={(e) => setTaxIcms(+e.target.value)}
                    />
                  </div>
                </div>

                {/* Total calculado */}
                <div className="flex justify-between items-center rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total de impostos</span>
                  <span className="font-bold text-primary">{totalTax.toFixed(2)}%</span>
                </div>
              </div>
            ) : (
              // Simples / MEI / Outro — campo único
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="tax"
                  label={
                    regime === "simples"
                      ? "Alíquota efetiva do Simples Nacional (%)"
                      : regime === "mei"
                      ? "Percentual aproximado sobre o faturamento (%)"
                      : "Total de impostos (%)"
                  }
                  tooltip={
                    regime === "simples"
                      ? "A alíquota efetiva está no seu PGDAS-D ou no aplicativo do Simples Nacional. Geralmente entre 4% e 19%."
                      : regime === "mei"
                      ? "O MEI paga um valor fixo (DAS). Se quiser, estime o % sobre seu faturamento médio. Pode deixar 0."
                      : "Informe o percentual total de impostos que incide sobre suas vendas."
                  }
                />
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(+e.target.value)}
                />
                {regime === "simples" && (
                  <p className="text-xs text-muted-foreground">
                    Não sabe a alíquota?{" "}
                    <a
                      href="https://www8.receita.fazenda.gov.br/SimplesNacional/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      Clique aqui
                    </a>{" "}
                    para consultar o portal do Simples Nacional.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumo antes de continuar */}
          <div className="rounded-lg border px-4 py-3 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Impacto total no preço</span>
            <span className="font-bold text-primary">
              Margem {margin}% + Impostos {totalTax.toFixed(2)}% ={" "}
              {(margin + totalTax).toFixed(2)}%
            </span>
          </div>

          <div className="border-t pt-6 flex justify-end">
            <Button onClick={continuar} size="lg">
              Calcular preço →
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}