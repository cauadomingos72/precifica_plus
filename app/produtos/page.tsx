"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { usePricingStore } from "@/store/pricing.store"

export default function ProdutosPage() {
  const { register, handleSubmit } = useForm()
  const setProduct = usePricingStore(s => s.setProduct)
  const router = useRouter()

  const onSubmit = (data: any) => {
    setProduct({ id: crypto.randomUUID(), ...data })
    router.push("/custos-diretos")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{padding:40}}>
      <h1>Cadastro do Produto</h1>

      <input {...register("name")} placeholder="Nome do produto" /><br/><br/>
      <input {...register("category")} placeholder="Categoria" /><br/><br/>
      <input {...register("unit")} placeholder="Unidade (un, kg...)" /><br/><br/>

      <button>Continuar</button>
    </form>
  )
}