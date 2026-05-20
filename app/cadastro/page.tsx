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
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const cadastrar = async () => {
    setError(null)
    setSuccess(null)

    const cleanCompanyName = companyName.trim()
    const cleanSegment = segment.trim()
    const cleanEmail = email.trim()

    if (!cleanCompanyName) {
      setError("Informe o nome da empresa.")
      return
    }

    if (!cleanEmail) {
      setError("Informe o e-mail.")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          company_name: cleanCompanyName,
          segment: cleanSegment,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError("Erro ao criar usuário.")
      setLoading(false)
      return
    }

    if (data.session) {
      const { error: companyError } = await supabase
        .from("companies")
        .upsert(
          {
            user_id: data.user.id,
            name: cleanCompanyName,
            segment: cleanSegment || null,
          },
          {
            onConflict: "user_id",
          }
        )

      if (companyError) {
        console.error("Erro ao salvar empresa:", companyError)
        setError("Conta criada, mas erro ao salvar empresa.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
      return
    }

    setSuccess(
      "Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro antes de entrar."
    )

    setLoading(false)
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button onClick={cadastrar} disabled={loading} className="w-full">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </div>
      </Card>
    </main>
  )
}