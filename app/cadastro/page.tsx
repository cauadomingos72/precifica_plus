"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"
import Link from "next/link"

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [segment, setSegment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const cadastrar = async () => {
    setError(null)

    if (!companyName) {
      setError("Informe o nome da empresa.")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    // 1. Cria o usuário no Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }

    // 2. Salva os dados da empresa
    const { error: companyError } = await supabase.from("companies").insert({
      user_id: data.user.id,
      name: companyName,
      segment,
    })

    if (companyError) {
      setError("Conta criada, mas erro ao salvar empresa. Tente novamente.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-sm">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-2">Criar conta</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Já tem conta?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Entrar
          </Link>
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nome da empresa *</Label>
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Doces da Maria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Alimentação, Vestuário, Serviços"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button onClick={cadastrar} disabled={loading} className="w-full">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </div>
      </Card>
    </main>
  )
}