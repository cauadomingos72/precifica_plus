"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Card from "@/components/Card"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("E-mail ou senha incorretos.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-sm">
      <Card>
        <h1 className="text-2xl font-bold text-primary mb-2">Entrar</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Não tem conta?{" "}
          <Link href="/cadastro" className="underline hover:text-primary">
            Cadastre-se
          </Link>
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button onClick={login} disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center">
            <Link
              href="/recuperar-senha"
              className="text-xs text-muted-foreground underline hover:text-primary"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}