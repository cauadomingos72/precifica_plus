"use client"

import { useState } from "react"
import { useAddDirectCost, useDirectCosts } from "@/store/pricing.store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CustosDiretos() {
  const addCost = useAddDirectCost()
  const directCosts = useDirectCosts()
  const router = useRouter()

  const [name, setName] = useState("")
  const [value, setValue] = useState(0)

  const add = () => {
    if (!name || value <= 0) return
    addCost({
      id: crypto.randomUUID(),
      name,
      costPerUnit: value
    })
    setName("")
    setValue(0)
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">Custos Diretos</h1>

        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="cost-name">Nome do custo</Label>
            <Input 
              id="cost-name"
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="Ex: Matéria-prima"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-value">Valor por unidade (R$)</Label>
            <Input 
              id="cost-value"
              type="number" 
              value={value || ""} 
              onChange={e=>setValue(+e.target.value)} 
              placeholder="0,00"
            />
          </div>

          <Button onClick={add} variant="secondary" className="w-full">
            Adicionar custo
          </Button>
        </div>

        {directCosts.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Custos Adicionados</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Valor/Un</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell className="text-right">R$ {cost.costPerUnit.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="border-t pt-6 flex justify-end">
          <Button onClick={()=>router.push("/custos-indiretos")} size="lg">
            Próximo Passo →
          </Button>
        </div>
      </Card>
    </main>
  )
}