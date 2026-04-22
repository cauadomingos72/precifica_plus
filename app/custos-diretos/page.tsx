"use client"

import { useState } from "react"
import { usePricingStore } from "@/store/pricing.store"
import { useRouter } from "next/navigation"

export default function CustosDiretos() {
  const addCost = usePricingStore(s => s.addDirectCost)
  const router = useRouter()

  const [name, setName] = useState("")
  const [value, setValue] = useState(0)

  const add = () => {
    addCost({
      id: crypto.randomUUID(),
      name,
      costPerUnit: value
    })
    alert("Custo adicionado!")
  }

  return (
    <div style={{padding:40}}>
      <h1>Custos Diretos</h1>

      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do custo"/><br/><br/>
      <input type="number" value={value} onChange={e=>setValue(+e.target.value)} placeholder="Valor"/><br/><br/>

      <button onClick={add}>Adicionar custo</button>
      <br/><br/>
      <button onClick={()=>router.push("/custos-indiretos")}>
        Continuar
      </button>
    </div>
  )
}