"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type DirectCostSnapshot = {
  id?: string
  name?: string
  costPerUnit?: number
}

type IndirectCostSnapshot = {
  id?: string
  name?: string
  monthlyValue?: number
}

type Calculation = {
  id: string
  product_name: string
  product_category: string | null
  product_unit: string | null
  direct_costs: DirectCostSnapshot[]
  indirect_costs: IndirectCostSnapshot[]
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

type Sale = {
  id: string
  user_id: string
  calculation_id: string
  product_name: string
  quantity: number
  unit_price: number
  unit_profit: number
  sale_date: string
  created_at: string
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

function getFirstDayOfMonth() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  return firstDay.toISOString().split("T")[0]
}

function isDateInRange(dateValue: string, startDate: string, endDate: string) {
  const date = dateValue.split("T")[0]

  if (startDate && date < startDate) return false
  if (endDate && date > endDate) return false

  return true
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(getTodayDate())

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const [{ data: company }, { data: calcs }, { data: salesData }] =
        await Promise.all([
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
            .order("created_at", { ascending: false }),

          supabase
            .from("sales")
            .select(
              "id, user_id, calculation_id, product_name, quantity, unit_price, unit_profit, sale_date, created_at"
            )
            .eq("user_id", user.id)
            .order("sale_date", { ascending: false }),
        ])

      if (company) setCompanyName(company.name)
      if (calcs) setCalculations(calcs as Calculation[])
      if (salesData) setSales(salesData as Sale[])

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

  const filteredCalculations = useMemo(() => {
    return calculations.filter((calculation) =>
      isDateInRange(calculation.created_at, startDate, endDate)
    )
  }, [calculations, startDate, endDate])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) =>
      isDateInRange(sale.sale_date, startDate, endDate)
    )
  }, [sales, startDate, endDate])

  const validCalculations = filteredCalculations.filter(
    (calculation) => calculation.result_price !== null
  )

  const summary = useMemo(() => {
    const total = validCalculations.length

    const totalPrice = validCalculations.reduce(
      (sum, calculation) => sum + Number(calculation.result_price ?? 0),
      0
    )

    const totalProfit = validCalculations.reduce(
      (sum, calculation) =>
        sum + Number(calculation.result_profit_per_unit ?? 0),
      0
    )

    const totalMargin = validCalculations.reduce(
      (sum, calculation) => sum + Number(calculation.margin_percent ?? 0),
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

  const salesSummary = useMemo(() => {
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_price),
      0
    )

    const totalProfit = filteredSales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_profit),
      0
    )

    const totalQuantity = filteredSales.reduce(
      (sum, sale) => sum + Number(sale.quantity),
      0
    )

    const groupedByProduct = filteredSales.reduce<
      Record<string, { product: string; quantity: number; revenue: number }>
    >((acc, sale) => {
      if (!acc[sale.product_name]) {
        acc[sale.product_name] = {
          product: sale.product_name,
          quantity: 0,
          revenue: 0,
        }
      }

      acc[sale.product_name].quantity += Number(sale.quantity)
      acc[sale.product_name].revenue +=
        Number(sale.quantity) * Number(sale.unit_price)

      return acc
    }, {})

    const topProducts = Object.values(groupedByProduct)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3)

    return {
      totalRevenue,
      totalProfit,
      totalQuantity,
      topProducts,
    }
  }, [filteredSales])

  const priceByProductData = useMemo(() => {
    return validCalculations
      .slice(0, 8)
      .reverse()
      .map((calculation) => ({
        product: calculation.product_name,
        price: Number(calculation.result_price ?? 0),
        profit: Number(calculation.result_profit_per_unit ?? 0),
      }))
  }, [validCalculations])

  const salesByProductData = useMemo(() => {
    return salesSummary.topProducts.map((product) => ({
      product: product.product,
      quantity: product.quantity,
      revenue: product.revenue,
    }))
  }, [salesSummary])

  const regimeData = useMemo(() => {
    const grouped = validCalculations.reduce<Record<string, number>>(
      (acc, calculation) => {
        const label =
          regimeLabel[calculation.tax_regime] ?? calculation.tax_regime

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

  const clearDateFilter = () => {
    setStartDate("")
    setEndDate("")
  }

  const setCurrentMonthFilter = () => {
    setStartDate(getFirstDayOfMonth())
    setEndDate(getTodayDate())
  }

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
            Visualize cálculos, vendas e indicadores filtrados por período para
            apoiar sua tomada de decisão.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push("/vendas")} variant="secondary">
            Vendas
          </Button>

          <Button onClick={() => router.push("/produtos")} variant="secondary">
            + Novo cálculo
          </Button>

          <Button onClick={logout} variant="ghost" size="sm">
            Sair
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <Button variant="secondary" onClick={setCurrentMonthFilter}>
            Mês atual
          </Button>

          <Button variant="ghost" onClick={clearDateFilter}>
            Limpar filtro
          </Button>
        </div>
      </Card>

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
              Faça seu primeiro cálculo para visualizar gráficos e indicadores.
            </p>

            <Button onClick={() => router.push("/produtos")}>
              Fazer primeiro cálculo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 mt-6">
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <p className="text-sm text-muted-foreground">
                Cálculos no período
              </p>

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

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-muted-foreground">
                Faturamento no período
              </p>

              <h2 className="text-3xl font-bold text-primary mt-2">
                R$ {salesSummary.totalRevenue.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Lucro estimado no período
              </p>

              <h2 className="text-3xl font-bold text-secondary mt-2">
                R$ {salesSummary.totalProfit.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Unidades vendidas no período
              </p>

              <h2 className="text-3xl font-bold text-accent mt-2">
                {salesSummary.totalQuantity}
              </h2>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Overview
              </h2>

              <p className="text-sm text-muted-foreground mb-5">
                Resumo geral dos cálculos e vendas no período selecionado.
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
                  <p className="font-medium">Top produtos vendidos</p>

                  {salesSummary.topProducts.length > 0 ? (
                    <ol className="text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                      {salesSummary.topProducts.map((product) => (
                        <li key={product.product}>
                          {product.product} — {product.quantity} un.
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      Nenhuma venda registrada no período.
                    </p>
                  )}
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
                Produtos mais vendidos
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Quantidade vendida no período selecionado.
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByProductData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="quantity"
                      name="Unidades vendidas"
                      fill="#F59E0B"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Regimes tributários
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Distribuição dos cálculos no período.
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

            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Leitura rápida
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Resumo interpretativo do período selecionado.
              </p>

              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-primary/5 p-4">
                  <strong>Faturamento:</strong>

                  <p className="text-muted-foreground mt-1">
                    O período selecionado possui R${" "}
                    {salesSummary.totalRevenue.toFixed(2)} em faturamento
                    registrado.
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/10 p-4">
                  <strong>Lucro estimado:</strong>

                  <p className="text-muted-foreground mt-1">
                    O lucro estimado no período é de R${" "}
                    {salesSummary.totalProfit.toFixed(2)}.
                  </p>
                </div>

                <div className="rounded-lg bg-accent/10 p-4">
                  <strong>Ação sugerida:</strong>

                  <p className="text-muted-foreground mt-1">
                    Compare os produtos mais vendidos com os produtos de maior
                    lucro unitário para priorizar o que realmente contribui para
                    o resultado.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Próximos passos
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Recomendações simples para melhorar a gestão.
              </p>

              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Registre vendas diariamente na página Vendas.</li>
                <li>• Revise produtos com baixo lucro unitário.</li>
                <li>• Compare preço sugerido com preço de mercado.</li>
                <li>• Recalcule produtos quando custos mudarem.</li>
              </ul>
            </Card>
          </section>

          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-primary">
                Histórico de cálculos
              </h2>

              <p className="text-sm text-muted-foreground">
                Cálculos realizados dentro do período selecionado.
              </p>
            </div>

            {filteredCalculations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum cálculo encontrado para o período selecionado.
              </p>
            ) : (
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
                    {filteredCalculations.map((calculation) => (
                      <TableRow key={calculation.id}>
                        <TableCell className="font-medium">
                          {calculation.product_name}
                        </TableCell>

                        <TableCell>
                          {regimeLabel[calculation.tax_regime] ??
                            calculation.tax_regime}
                        </TableCell>

                        <TableCell className="text-right">
                          {calculation.margin_percent}%
                        </TableCell>

                        <TableCell className="text-right">
                          R${" "}
                          {Number(
                            calculation.result_profit_per_unit ?? 0
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-primary">
                          R${" "}
                          {Number(calculation.result_price ?? 0).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(calculation.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}
    </main>
  )
}