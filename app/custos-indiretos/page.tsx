"use client"

import { useState } from "react"
import { usePricingStore } from "@/store/pricing.store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"

export default function CustosIndiretos() {
  const addCost = usePricingStore((s) => s.addIndirectCost)
  const router = useRouter()

  const [name, setName] = useState("")
  const [value, setValue] = useState(0)

  const add = () => {
    if (!name || value <= 0) return

    addCost({
      id: crypto.randomUUID(),
      name,
      monthlyValue: value
    })

    setName("")
    setValue(0)
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">Custos Indiretos (mensais)</h1>

        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="indirect-name">Nome do custo</Label>
            <Input
              id="indirect-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel, Internet"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indirect-value">Valor mensal (R$)</Label>
            <Input
              id="indirect-value"
              type="number"
              value={value || ""}
              onChange={(e) => setValue(+e.target.value)}
              placeholder="0,00"
            />
          </div>

          <Button onClick={add} variant="secondary" className="w-full">
            Adicionar custo indireto
          </Button>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <Button onClick={() => router.push("/margem")} size="lg">
            Ir para Margem →
          </Button>
        </div>
      </Card>
    </main>
  )
}