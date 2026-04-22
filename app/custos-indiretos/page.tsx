"use client"

import { useState } from "react"
import { usePricingStore } from "@/store/pricing.store"
import { useRouter } from "next/navigation"

export default function CustosIndiretos() {
  const addCost = usePricingStore((s) => s.addIndirectCost)
  const router = useRouter()

  const [name, setName] = useState("")
  const [value, setValue] = useState(0)

  const add = () => {
    if (!name || value <= 0) {
      alert("Preencha nome e valor")
      return
    }

    addCost({
      id: crypto.randomUUID(),
      name,
      monthlyValue: value
    })

    setName("")
    setValue(0)
    alert("Custo indireto adicionado!")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Custos Indiretos (mensais)</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Aluguel"
      /><br/><br/>

      <input
        type="number"
        value={value}
        onChange={(e) => setValue(+e.target.value)}
        placeholder="Valor mensal"
      /><br/><br/>

      <button onClick={add}>Adicionar custo</button>

      <br/><br/>
      <button onClick={() => router.push("/margem")}>
        Ir para Margem →
      </button>
    </div>
  )
}