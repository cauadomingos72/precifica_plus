"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { usePricingStore } from "@/store/pricing.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"

export default function ProdutosPage() {
  const { register, handleSubmit } = useForm()
  const setProduct = usePricingStore(s => s.setProduct)
  const router = useRouter()

  const onSubmit = (data: any) => {
    setProduct({ id: crypto.randomUUID(), ...data })
    router.push("/custos-diretos")
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">Cadastro do Produto</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do produto</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Cadeira de Madeira" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" {...register("category")} placeholder="Ex: Móveis" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Input id="unit" {...register("unit")} placeholder="Ex: un, kg, m..." />
          </div>

          <Button className="w-full mt-4" size="lg">Continuar</Button>
        </form>
      </Card>
    </main>
  )
}