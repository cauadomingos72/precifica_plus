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

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState("")
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [saleQuantity, setSaleQuantity] = useState("")
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [savingSale, setSavingSale] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState("")
  const [dashboardError, setDashboardError] = useState("")

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)

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
            .order("created_at", { ascending: false })
            .limit(50),

          supabase
            .from("sales")
            .select(
              "id, user_id, calculation_id, product_name, quantity, unit_price, unit_profit, sale_date, created_at"
            )
            .eq("user_id", user.id)
            .order("sale_date", { ascending: false })
            .limit(100),
        ])

      if (company) setCompanyName(company.name)

      if (calcs) {
        const formattedCalcs = calcs as Calculation[]
        setCalculations(formattedCalcs)

        if (formattedCalcs.length > 0) {
          setSelectedId(formattedCalcs[0].id)
        }
      }

      if (salesData) {
        setSales(salesData as Sale[])
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

  const salesSummary = useMemo(() => {
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_price),
      0
    )

    const totalProfit = sales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_profit),
      0
    )

    const totalQuantity = sales.reduce(
      (sum, sale) => sum + Number(sale.quantity),
      0
    )

    const groupedByProduct = sales.reduce<
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
  }, [sales])

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

  const salesByProductData = useMemo(() => {
    return salesSummary.topProducts.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      revenue: item.revenue,
    }))
  }, [salesSummary])

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

  const selectedProductSales = useMemo(() => {
    if (!selectedCalculation) return []

    return sales.filter(
      (sale) => sale.calculation_id === selectedCalculation.id
    )
  }, [sales, selectedCalculation])

  const selectedProductSalesSummary = useMemo(() => {
    const quantity = selectedProductSales.reduce(
      (sum, sale) => sum + Number(sale.quantity),
      0
    )

    const revenue = selectedProductSales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_price),
      0
    )

    const profit = selectedProductSales.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_profit),
      0
    )

    return {
      quantity,
      revenue,
      profit,
    }
  }, [selectedProductSales])

  const registerSale = async () => {
    setDashboardMessage("")
    setDashboardError("")

    if (!selectedCalculation) {
      setDashboardError("Selecione um produto para registrar a venda.")
      return
    }

    const quantity = Number(saleQuantity)

    if (!quantity || quantity <= 0) {
      setDashboardError("Informe uma quantidade vendida válida.")
      return
    }

    setSavingSale(true)

    const payload = {
      user_id: userId,
      calculation_id: selectedCalculation.id,
      product_name: selectedCalculation.product_name,
      quantity,
      unit_price: Number(selectedCalculation.result_price ?? 0),
      unit_profit: Number(selectedCalculation.result_profit_per_unit ?? 0),
      sale_date: saleDate,
    }

    const { data, error } = await supabase
      .from("sales")
      .insert(payload)
      .select()
      .single()

    setSavingSale(false)

    if (error) {
      console.error(error)
      setDashboardError("Não foi possível registrar a venda.")
      return
    }

    setSales((current) => [data as Sale, ...current])
    setSaleQuantity("")
    setDashboardMessage("Venda registrada com sucesso.")
  }

  const deleteCalculation = async (calculationId: string) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este cálculo? As vendas associadas a ele também serão removidas."
    )

    if (!confirmDelete) return

    setDashboardMessage("")
    setDashboardError("")

    const { error } = await supabase
      .from("calculations")
      .delete()
      .eq("id", calculationId)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      setDashboardError("Não foi possível excluir o cálculo.")
      return
    }

    const updatedCalculations = calculations.filter(
      (calc) => calc.id !== calculationId
    )

    setCalculations(updatedCalculations)

    setSales((current) =>
      current.filter((sale) => sale.calculation_id !== calculationId)
    )

    if (selectedId === calculationId) {
      setSelectedId(updatedCalculations[0]?.id ?? null)
    }

    setDashboardMessage("Cálculo excluído com sucesso.")
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
            Visualize cálculos, registre vendas diárias e acompanhe indicadores
            para tomar decisões de preço com mais segurança.
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

      {dashboardMessage && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {dashboardMessage}
        </div>
      )}

      {dashboardError && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {dashboardError}
        </div>
      )}

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
              Faça seu primeiro cálculo para visualizar o overview, registrar
              vendas e acompanhar os detalhes dos produtos.
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

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-muted-foreground">
                Faturamento registrado
              </p>
              <h2 className="text-3xl font-bold text-primary mt-2">
                R$ {salesSummary.totalRevenue.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Lucro estimado registrado
              </p>
              <h2 className="text-3xl font-bold text-secondary mt-2">
                R$ {salesSummary.totalProfit.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Unidades vendidas
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
                Resumo geral dos cálculos e vendas registradas.
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
                      Nenhuma venda registrada ainda.
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
                Quantidade registrada por produto.
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

          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Produtos calculados
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                Selecione um produto para ver detalhes, registrar vendas ou
                excluir o cálculo.
              </p>

              <div className="space-y-2">
                {calculations.map((calc) => (
                  <div
                    key={calc.id}
                    className={`rounded-lg border px-4 py-3 transition ${
                      selectedCalculation?.id === calc.id
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-white hover:bg-muted/40"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedId(calc.id)}
                      className="w-full text-left"
                    >
                      <p className="font-medium">{calc.product_name}</p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(calc.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive"
                      onClick={() => deleteCalculation(calc.id)}
                    >
                      Excluir cálculo
                    </Button>
                  </div>
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
                      Detalhamento do cálculo selecionado e registro de vendas.
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

                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">
                        Vendido no período
                      </p>
                      <p className="text-xl font-bold">
                        {selectedProductSalesSummary.quantity} un.
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">
                        Faturamento do produto
                      </p>
                      <p className="text-xl font-bold text-primary">
                        R$ {selectedProductSalesSummary.revenue.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">
                        Lucro estimado do produto
                      </p>
                      <p className="text-xl font-bold text-secondary">
                        R$ {selectedProductSalesSummary.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 rounded-xl border bg-muted/10 p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-primary">
                        Registrar venda do dia
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Informe quantas unidades deste produto foram vendidas.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Quantidade vendida
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={saleQuantity}
                          onChange={(e) => setSaleQuantity(e.target.value)}
                          placeholder="Ex: 10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Data da venda
                        </label>
                        <Input
                          type="date"
                          value={saleDate}
                          onChange={(e) => setSaleDate(e.target.value)}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          onClick={registerSale}
                          disabled={savingSale}
                          className="w-full"
                        >
                          {savingSale ? "Salvando..." : "Registrar venda"}
                        </Button>
                      </div>
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

          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-primary">
                Histórico de vendas
              </h2>

              <p className="text-sm text-muted-foreground">
                Últimas vendas registradas pelo usuário.
              </p>
            </div>

            {sales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Lucro estimado</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.product_name}
                        </TableCell>

                        <TableCell className="text-right">
                          {sale.quantity}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-primary">
                          R${" "}
                          {(
                            Number(sale.quantity) * Number(sale.unit_price)
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-right text-secondary font-semibold">
                          R${" "}
                          {(
                            Number(sale.quantity) * Number(sale.unit_profit)
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(sale.sale_date).toLocaleDateString(
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