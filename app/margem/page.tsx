"use client"

import { useState } from "react"
import { useSetConfig } from "@/store/pricing.store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"

export default function MargemPage() {
  const setConfig = useSetConfig()
  const router = useRouter()

  const [margin, setMargin] = useState(20)
  const [tax, setTax] = useState(10)
  const [production, setProduction] = useState(100)

  const continuar = () => {
    if (production <= 0) return

    setConfig({
      marginPercent: margin,
      taxPercent: tax,
      monthlyProduction: production
    })

    router.push("/resultado")
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">Margem, Impostos e Produção</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="margin">Margem de lucro (%)</Label>
            <Input
              id="margin"
              type="number"
              value={margin}
              onChange={(e) => setMargin(+e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">Impostos (%)</Label>
            <Input
              id="tax"
              type="number"
              value={tax}
              onChange={(e) => setTax(+e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production">Produção mensal (unidades)</Label>
            <Input
              id="production"
              type="number"
              value={production}
              onChange={(e) => setProduction(+e.target.value)}
            />
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