"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Card from "@/components/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Calculation = {
  id: string
  product_name: string
  product_category: string | null
  product_unit: string | null
  direct_costs: any[]
  indirect_costs: any[]
  margin_percent: number
  monthly_production: number
  tax_regime: string
  tax_percent: number | null
  tax_pis: number | null
  tax_cofins: number | null
  tax_iss: number | null
  tax_icms: number | null
  result_price: number | null
  result_unit_cost: number | null
  result_profit_per_unit: number | null
  result_breakeven_units: number | null
  created_at: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const [{ data: company }, { data: calcs }] = await Promise.all([
        supabase
          .from("companies")
          .select("name")
          .eq("user_id", user.id)
          .single(),

        supabase
          .from("calculations")
          .select(
            `
            id,
            product_name,
            product_category,
            product_unit,
            direct_costs,
            indirect_costs,
            margin_percent,
            monthly_production,
            tax_regime,
            tax_percent,
            tax_pis,
            tax_cofins,
            tax_iss,
            tax_icms,
            result_price,
            result_unit_cost,
            result_profit_per_unit,
            result_breakeven_units,
            created_at
            `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ])

      if (company) setCompanyName(company.name)

      if (calcs) {
        setCalculations(calcs)
        if (calcs.length > 0) {
          setSelectedId(calcs[0].id)
        }
      }

      setLoading(false)
    }

    load()
  }, [router, supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const regimeLabel: Record<string, string> = {
    simples: "Simples Nacional",
    mei: "MEI",
    presumido: "Lucro Presumido",
    outro: "Outro",
  }

  const validCalculations = calculations.filter((c) => c.result_price !== null)

  const selectedCalculation =
    calculations.find((c) => c.id === selectedId) ?? calculations[0]

  const summary = useMemo(() => {
    const total = validCalculations.length

    const totalPrice = validCalculations.reduce(
      (sum, c) => sum + Number(c.result_price ?? 0),
      0
    )

    const totalProfit = validCalculations.reduce(
      (sum, c) => sum + Number(c.result_profit_per_unit ?? 0),
      0
    )

    const totalMargin = validCalculations.reduce(
      (sum, c) => sum + Number(c.margin_percent ?? 0),
      0
    )

    const averagePrice = total > 0 ? totalPrice / total : 0
    const averageProfit = total > 0 ? totalProfit / total : 0
    const averageMargin = total > 0 ? totalMargin / total : 0

    const highestPriceProduct =
      total > 0
        ? [...validCalculations].sort(
            (a, b) => Number(b.result_price) - Number(a.result_price)
          )[0]
        : null

    const highestProfitProduct =
      total > 0
        ? [...validCalculations].sort(
            (a, b) =>
              Number(b.result_profit_per_unit ?? 0) -
              Number(a.result_profit_per_unit ?? 0)
          )[0]
        : null

    return {
      total,
      averagePrice,
      averageProfit,
      averageMargin,
      highestPriceProduct,
      highestProfitProduct,
    }
  }, [validCalculations])

  const priceByProductData = useMemo(() => {
    return validCalculations
      .slice(0, 8)
      .reverse()
      .map((c) => ({
        product: c.product_name,
        price: Number(c.result_price ?? 0),
        profit: Number(c.result_profit_per_unit ?? 0),
      }))
  }, [validCalculations])

  const regimeData = useMemo(() => {
    const grouped = validCalculations.reduce<Record<string, number>>(
      (acc, calc) => {
        const label = regimeLabel[calc.tax_regime] ?? calc.tax_regime
        acc[label] = (acc[label] ?? 0) + 1
        return acc
      },
      {}
    )

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }))
  }, [validCalculations])

  const directCostsTotal = useMemo(() => {
    if (!selectedCalculation?.direct_costs) return 0

    return selectedCalculation.direct_costs.reduce(
      (sum, cost) => sum + Number(cost.costPerUnit ?? 0),
      0
    )
  }, [selectedCalculation])

  const indirectCostsTotal = useMemo(() => {
    if (!selectedCalculation?.indirect_costs) return 0

    return selectedCalculation.indirect_costs.reduce(
      (sum, cost) => sum + Number(cost.monthlyValue ?? 0),
      0
    )
  }, [selectedCalculation])

  const costCompositionData = useMemo(() => {
    if (!selectedCalculation) return []

    return [
      {
        name: "Custos diretos",
        value: directCostsTotal,
      },
      {
        name: "Custos indiretos mensais",
        value: indirectCostsTotal,
      },
    ]
  }, [selectedCalculation, directCostsTotal, indirectCostsTotal])

  return (
    <main className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

          {companyName && (
            <p className="text-sm text-muted-foreground mt-1">
              {companyName}
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-2">
            Visualize um panorama dos seus cálculos e acompanhe indicadores para
            tomar decisões de preço com mais segurança.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push("/produtos")} variant="secondary">
            + Novo cálculo
          </Button>

          <Button onClick={logout} variant="ghost" size="sm">
            Sair
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </Card>
      ) : calculations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-primary mb-2">
              Nenhum cálculo salvo ainda
            </h2>

            <p className="text-muted-foreground mb-6">
              Faça seu primeiro cálculo para visualizar o overview e os detalhes
              dos produtos.
            </p>

            <Button onClick={() => router.push("/produtos")}>
              Fazer primeiro cálculo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <p className="text-sm text-muted-foreground">Cálculos salvos</p>
              <h2 className="text-3xl font-bold text-primary mt-2">
                {summary.total}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">Preço médio</p>
              <h2 className="text-3xl font-bold text-primary mt-2">
                R$ {summary.averagePrice.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Lucro médio por unidade
              </p>
              <h2 className="text-3xl font-bold text-secondary mt-2">
                R$ {summary.averageProfit.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">Margem média</p>
              <h2 className="text-3xl font-bold text-accent mt-2">
                {summary.averageMargin.toFixed(1)}%
              </h2>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Overview
              </h2>

              <p className="text-sm text-muted-foreground mb-5">
                Resumo geral dos cálculos realizados.
              </p>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="font-medium">Produto com maior preço</p>
                  <p className="text-muted-foreground mt-1">
                    {summary.highestPriceProduct
                      ? `${summary.highestPriceProduct.product_name} — R$ ${Number(
                          summary.highestPriceProduct.result_price
                        ).toFixed(2)}`
                      : "Sem dados suficientes"}
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/10 p-4">
                  <p className="font-medium">Produto com maior lucro unitário</p>
                  <p className="text-muted-foreground mt-1">
                    {summary.highestProfitProduct
                      ? `${summary.highestProfitProduct.product_name} — R$ ${Number(
                          summary.highestProfitProduct.result_profit_per_unit
                        ).toFixed(2)}`
                      : "Sem dados suficientes"}
                  </p>
                </div>

                <div className="rounded-lg bg-accent/10 p-4">
                  <p className="font-medium">Ação sugerida</p>
                  <p className="text-muted-foreground mt-1">
                    Revise produtos com lucro unitário baixo e compare o preço
                    sugerido com o preço praticado no mercado.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Preço e lucro por produto
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Comparação entre preço sugerido e lucro unitário.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceByProductData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value) =>
                        `R$ ${Number(value).toFixed(2)}`
                      }
                    />
                    <Bar dataKey="price" name="Preço" fill="#0F2A44" />
                    <Bar dataKey="profit" name="Lucro" fill="#1FAF9A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Regimes tributários
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Distribuição dos cálculos por regime.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regimeData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={85}
                      label
                    >
                      {regimeData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            ["#0F2A44", "#1FAF9A", "#F59E0B", "#94A3B8"][
                              index % 4
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Produtos calculados
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Selecione um produto para ver a análise individual.
              </p>

              <div className="space-y-2">
                {calculations.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setSelectedId(calc.id)}
                    className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                      selectedCalculation?.id === calc.id
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-white hover:bg-muted/40"
                    }`}
                  >
                    <p className="font-medium">{calc.product_name}</p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(calc.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              {selectedCalculation ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-primary">
                      Análise individual: {selectedCalculation.product_name}
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                      Detalhamento do último cálculo selecionado.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">
                        Preço sugerido
                      </p>
                      <p className="text-xl font-bold text-primary">
                        R${" "}
                        {Number(
                          selectedCalculation.result_price ?? 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-4">
                      <p className="text-xs text-muted-foreground">
                        Custo unitário
                      </p>
                      <p className="text-xl font-bold">
                        R${" "}
                        {Number(
                          selectedCalculation.result_unit_cost ?? 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/10 p-4">
                      <p className="text-xs text-muted-foreground">
                        Lucro unitário
                      </p>
                      <p className="text-xl font-bold text-secondary">
                        R${" "}
                        {Number(
                          selectedCalculation.result_profit_per_unit ?? 0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-accent/10 p-4">
                      <p className="text-xs text-muted-foreground">
                        Ponto de equilíbrio
                      </p>
                      <p className="text-xl font-bold text-accent">
                        {Number(
                          selectedCalculation.result_breakeven_units ?? 0
                        )}{" "}
                        un.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="font-semibold text-primary mb-3">
                        Dados do cálculo
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Categoria
                          </span>
                          <strong>
                            {selectedCalculation.product_category ?? "-"}
                          </strong>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Unidade
                          </span>
                          <strong>
                            {selectedCalculation.product_unit ?? "-"}
                          </strong>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Margem
                          </span>
                          <strong>{selectedCalculation.margin_percent}%</strong>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Produção mensal
                          </span>
                          <strong>
                            {selectedCalculation.monthly_production} un.
                          </strong>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Regime tributário
                          </span>
                          <strong>
                            {regimeLabel[selectedCalculation.tax_regime] ??
                              selectedCalculation.tax_regime}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-3">
                        Composição de custos
                      </h3>

                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={costCompositionData}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={75}
                              label
                            >
                              <Cell fill="#0F2A44" />
                              <Cell fill="#1FAF9A" />
                            </Pie>

                            <Tooltip
                              formatter={(value) =>
                                `R$ ${Number(value).toFixed(2)}`
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Selecione um produto para visualizar os detalhes.
                </p>
              )}
            </Card>
          </section>

          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-primary">
                Histórico de cálculos
              </h2>

              <p className="text-sm text-muted-foreground">
                Lista completa dos cálculos salvos recentemente.
              </p>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Regime</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Lucro unitário</TableHead>
                    <TableHead className="text-right">Preço sugerido</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {calculations.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.product_name}
                      </TableCell>

                      <TableCell>
                        {regimeLabel[c.tax_regime] ?? c.tax_regime}
                      </TableCell>

                      <TableCell className="text-right">
                        {c.margin_percent}%
                      </TableCell>

                      <TableCell className="text-right">
                        R${" "}
                        {Number(c.result_profit_per_unit ?? 0).toFixed(2)}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-primary">
                        R$ {Number(c.result_price ?? 0).toFixed(2)}
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}