"use client"

import { useEffect, useState } from "react"
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

type Calculation = {
  id: string
  product_name: string
  result_price: number | null
  margin_percent: number
  tax_regime: string
  created_at: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(true)

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
            "id, product_name, result_price, margin_percent, tax_regime, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ])

      if (company) setCompanyName(company.name)
      if (calcs) setCalculations(calcs)

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

  return (
    <main className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>

            {companyName && (
              <p className="text-sm text-muted-foreground">{companyName}</p>
            )}
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
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : calculations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum cálculo salvo ainda.
            </p>

            <Button onClick={() => router.push("/produtos")}>
              Fazer primeiro cálculo
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
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

                    <TableCell className="text-right font-semibold text-primary">
                      {c.result_price !== null
                        ? `R$ ${Number(c.result_price).toFixed(2)}`
                        : "Não calculado"}
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </main>
  )
}