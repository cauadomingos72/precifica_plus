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

export default function VendasPage() {
  const supabase = createClient()
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]

  const [userId, setUserId] = useState("")
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [saleQuantity, setSaleQuantity] = useState("")
  const [saleDate, setSaleDate] = useState(today)

  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)
  const [editSaleQuantity, setEditSaleQuantity] = useState("")
  const [editSaleDate, setEditSaleDate] = useState("")
  const [updatingSale, setUpdatingSale] = useState(false)

  const [loading, setLoading] = useState(true)
  const [savingSale, setSavingSale] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

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

      const [{ data: calcs }, { data: salesData }] = await Promise.all([
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
          .order("sale_date", { ascending: false })
          .limit(100),
      ])

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

  const selectedCalculation =
    calculations.find((calc) => calc.id === selectedId) ?? calculations[0]

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

  const salesToday = useMemo(() => {
    return sales.filter((sale) => sale.sale_date === today)
  }, [sales, today])

  const totalSalesToday = useMemo(() => {
    return salesToday.reduce((sum, sale) => sum + Number(sale.quantity), 0)
  }, [salesToday])

  const totalRevenueToday = useMemo(() => {
    return salesToday.reduce(
      (sum, sale) => sum + Number(sale.quantity) * Number(sale.unit_price),
      0
    )
  }, [salesToday])

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

  const clearMessages = () => {
    setMessage("")
    setErrorMessage("")
  }

  const registerSale = async () => {
    clearMessages()

    if (!selectedCalculation) {
      setErrorMessage("Selecione um produto para registrar a venda.")
      return
    }

    const quantity = Number(saleQuantity)

    if (!quantity || quantity <= 0) {
      setErrorMessage("Informe uma quantidade vendida válida.")
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
      setErrorMessage("Não foi possível registrar a venda.")
      return
    }

    setSales((current) => [data as Sale, ...current])
    setSaleQuantity("")
    setMessage("Venda registrada com sucesso.")
  }

  const startEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id)
    setEditSaleQuantity(String(sale.quantity))
    setEditSaleDate(sale.sale_date)
    clearMessages()
  }

  const cancelEditSale = () => {
    setEditingSaleId(null)
    setEditSaleQuantity("")
    setEditSaleDate("")
  }

  const updateSale = async (saleId: string) => {
    clearMessages()

    const quantity = Number(editSaleQuantity)

    if (!quantity || quantity <= 0) {
      setErrorMessage("Informe uma quantidade válida para atualizar a venda.")
      return
    }

    if (!editSaleDate) {
      setErrorMessage("Informe uma data válida para atualizar a venda.")
      return
    }

    setUpdatingSale(true)

    const { data, error } = await supabase
      .from("sales")
      .update({
        quantity,
        sale_date: editSaleDate,
      })
      .eq("id", saleId)
      .eq("user_id", userId)
      .select()
      .single()

    setUpdatingSale(false)

    if (error) {
      console.error(error)
      setErrorMessage("Não foi possível atualizar a venda.")
      return
    }

    setSales((current) =>
      current.map((sale) => (sale.id === saleId ? (data as Sale) : sale))
    )

    cancelEditSale()
    setMessage("Venda atualizada com sucesso.")
  }

  const deleteSale = async (saleId: string) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este registro de venda?"
    )

    if (!confirmDelete) return

    clearMessages()

    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", saleId)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      setErrorMessage("Não foi possível excluir a venda.")
      return
    }

    setSales((current) => current.filter((sale) => sale.id !== saleId))

    if (editingSaleId === saleId) {
      cancelEditSale()
    }

    setMessage("Venda excluída com sucesso.")
  }

  const deleteCalculation = async (calculationId: string) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este cálculo? As vendas associadas a ele também serão removidas."
    )

    if (!confirmDelete) return

    clearMessages()

    const { error } = await supabase
      .from("calculations")
      .delete()
      .eq("id", calculationId)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      setErrorMessage("Não foi possível excluir o cálculo.")
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

    setMessage("Cálculo excluído com sucesso.")
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Vendas</h1>

          <p className="text-sm text-muted-foreground mt-2">
            Registre diariamente as vendas realizadas e acompanhe o desempenho
            de cada produto calculado.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard")} variant="ghost">
            Dashboard
          </Button>

          <Button onClick={() => router.push("/produtos")} variant="secondary">
            + Adicionar produto
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="text-muted-foreground text-sm">Carregando vendas...</p>
        </Card>
      ) : calculations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-primary mb-2">
              Nenhum produto calculado ainda
            </h2>

            <p className="text-muted-foreground mb-6">
              Para registrar vendas, primeiro adicione um produto e realize o
              cálculo de precificação.
            </p>

            <Button onClick={() => router.push("/produtos")}>
              Adicionar primeiro produto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-muted-foreground">
                Vendas registradas hoje
              </p>

              <h2 className="text-3xl font-bold text-primary mt-2">
                {totalSalesToday} un.
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">
                Faturamento de hoje
              </p>

              <h2 className="text-3xl font-bold text-secondary mt-2">
                R$ {totalRevenueToday.toFixed(2)}
              </h2>
            </Card>

            <Card>
              <p className="text-sm text-muted-foreground">Lembrete diário</p>

              <p className="text-sm mt-2">
                {salesToday.length > 0
                  ? "Você já registrou vendas hoje."
                  : "Não esqueça de registrar as vendas feitas no dia."}
              </p>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <Card>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-primary">
                  Produtos calculados
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Selecione um produto para registrar venda, analisar ou excluir.
                </p>
              </div>

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
                        R$ {Number(calc.result_price ?? 0).toFixed(2)} •{" "}
                        {new Date(calc.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </button>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedId(calc.id)}
                      >
                        Ver
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteCalculation(calc.id)}
                      >
                        Excluir
                      </Button>
                    </div>
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
                      Registre as vendas deste produto e acompanhe seus
                      resultados.
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
                        Vendido no histórico
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
                        Lucro estimado
                      </p>

                      <p className="text-xl font-bold text-secondary">
                        R$ {selectedProductSalesSummary.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/10 p-4 space-y-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-primary">
                        Registrar venda do dia
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Informe quantas unidades deste produto foram vendidas.
                        Recomendamos preencher essa informação todos os dias.
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
                            Custos diretos
                          </span>

                          <strong>R$ {directCostsTotal.toFixed(2)}</strong>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">
                            Custos indiretos mensais
                          </span>

                          <strong>R$ {indirectCostsTotal.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-3">
                        Histórico deste produto
                      </h3>

                      {selectedProductSales.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma venda registrada para este produto ainda.
                        </p>
                      ) : (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">
                                  Quantidade
                                </TableHead>
                                <TableHead className="text-right">
                                  Faturamento
                                </TableHead>
                                <TableHead className="text-right">
                                  Ações
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {selectedProductSales.map((sale) => {
                                const isEditing = editingSaleId === sale.id

                                return (
                                  <TableRow key={sale.id}>
                                    <TableCell>
                                      {isEditing ? (
                                        <Input
                                          type="date"
                                          value={editSaleDate}
                                          onChange={(e) =>
                                            setEditSaleDate(e.target.value)
                                          }
                                        />
                                      ) : (
                                        new Date(
                                          sale.sale_date
                                        ).toLocaleDateString("pt-BR")
                                      )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                      {isEditing ? (
                                        <Input
                                          type="number"
                                          min="1"
                                          value={editSaleQuantity}
                                          onChange={(e) =>
                                            setEditSaleQuantity(e.target.value)
                                          }
                                          className="text-right"
                                        />
                                      ) : (
                                        sale.quantity
                                      )}
                                    </TableCell>

                                    <TableCell className="text-right font-semibold text-primary">
                                      R${" "}
                                      {(
                                        Number(sale.quantity) *
                                        Number(sale.unit_price)
                                      ).toFixed(2)}
                                    </TableCell>

                                    <TableCell className="text-right">
                                      {isEditing ? (
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => updateSale(sale.id)}
                                            disabled={updatingSale}
                                          >
                                            {updatingSale
                                              ? "Salvando..."
                                              : "Salvar"}
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEditSale}
                                          >
                                            Cancelar
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => startEditSale(sale)}
                                          >
                                            Editar
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => deleteSale(sale.id)}
                                          >
                                            Excluir
                                          </Button>
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
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
                Histórico geral de vendas
              </h2>

              <p className="text-sm text-muted-foreground">
                Use este histórico para manter o acompanhamento diário das
                vendas registradas.
              </p>
            </div>

            {sales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada ainda. Registre as vendas realizadas no
                dia para melhorar a análise do dashboard.
              </p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">
                        Lucro estimado
                      </TableHead>
                      <TableHead className="text-right">Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sales.map((sale) => {
                      const isEditing = editingSaleId === sale.id

                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">
                            {sale.product_name}
                          </TableCell>

                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="1"
                                value={editSaleQuantity}
                                onChange={(e) =>
                                  setEditSaleQuantity(e.target.value)
                                }
                                className="text-right"
                              />
                            ) : (
                              sale.quantity
                            )}
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
                            {isEditing ? (
                              <Input
                                type="date"
                                value={editSaleDate}
                                onChange={(e) =>
                                  setEditSaleDate(e.target.value)
                                }
                              />
                            ) : (
                              new Date(sale.sale_date).toLocaleDateString(
                                "pt-BR"
                              )
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateSale(sale.id)}
                                  disabled={updatingSale}
                                >
                                  {updatingSale ? "Salvando..." : "Salvar"}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditSale}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditSale(sale)}
                                >
                                  Editar
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteSale(sale.id)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
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