"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useSetProduct } from "@/store/pricing.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"

export default function ProdutosPage() {
  const { register, handleSubmit } = useForm()
  const setProduct = useSetProduct()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [supabase])

  const onSubmit = (data: any) => {
    setProduct({ id: crypto.randomUUID(), ...data })
    router.push("/custos-diretos")
  }

  if (loading) {
    return (
      <main className="container mx-auto py-12 px-4 max-w-xl">
        <Card>
          <p className="text-muted-foreground">Carregando...</p>
        </Card>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="container mx-auto py-12 px-4 max-w-xl">
        <Card>
          <h1 className="text-2xl font-bold text-primary mb-4">
            Login necessário
          </h1>

          <p className="text-muted-foreground mb-6">
            Para realizar o cálculo de precificação e salvar suas informações no
            dashboard, é necessário entrar ou criar uma conta.
          </p>

          <Link href="/login">
            <Button className="w-full" size="lg">
              Entrar / Cadastrar
            </Button>
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-6">
          Cadastro do Produto
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do produto</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Cadeira de Madeira"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Ex: Móveis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Input
              id="unit"
              {...register("unit")}
              placeholder="Ex: un, kg, m..."
            />
          </div>

          <Button className="w-full mt-4" size="lg">
            Continuar
          </Button>
        </form>
      </Card>
    </main>
  )
}