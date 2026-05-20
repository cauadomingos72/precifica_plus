"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Card from "@/components/Card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function ContaPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [segment, setSegment] = useState("")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name ?? "")
        setPhone(profile.phone ?? "")
      }

      const { data: company } = await supabase
        .from("companies")
        .select("name, cnpj, segment")
        .eq("user_id", user.id)
        .single()

      if (company) {
        setCompanyName(company.name ?? "")
        setCnpj(company.cnpj ?? "")
        setSegment(company.segment ?? "")
      }

      setLoading(false)
    }

    loadAccount()
  }, [router, supabase])

  const clearMessages = () => {
    setMessage("")
    setErrorMessage("")
  }

  const saveProfile = async () => {
    clearMessages()
    setSavingProfile(true)

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      updated_at: new Date().toISOString(),
    })

    setSavingProfile(false)

    if (error) {
      setErrorMessage("Não foi possível salvar os dados pessoais.")
      return
    }

    setMessage("Dados pessoais atualizados com sucesso.")
  }

  const saveCompany = async () => {
    clearMessages()
    setSavingCompany(true)

    const { error } = await supabase.from("companies").upsert({
      user_id: userId,
      name: companyName,
      cnpj,
      segment,
    })

    setSavingCompany(false)

    if (error) {
      setErrorMessage("Não foi possível salvar os dados da empresa.")
      return
    }

    setMessage("Dados da empresa atualizados com sucesso.")
  }

  const changePassword = async () => {
    clearMessages()

    if (newPassword.length < 6) {
      setErrorMessage("A nova senha precisa ter pelo menos 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.")
      return
    }

    setChangingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setChangingPassword(false)

    if (error) {
      setErrorMessage("Não foi possível alterar a senha.")
      return
    }

    setNewPassword("")
    setConfirmPassword("")
    setMessage("Senha alterada com sucesso.")
  }

  const deleteAccount = async () => {
    clearMessages()

    if (deleteConfirmation !== "EXCLUIR MINHA CONTA") {
      setErrorMessage("Digite a frase de confirmação corretamente.")
      return
    }

    setDeletingAccount(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setErrorMessage("Sessão expirada. Faça login novamente.")
      setDeletingAccount(false)
      return
    }

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        confirmation: deleteConfirmation,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setErrorMessage(data.error ?? "Não foi possível excluir a conta.")
      setDeletingAccount(false)
      return
    }

    await supabase.auth.signOut()

    router.push("/login")
    router.refresh()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <main className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <p className="text-muted-foreground">Carregando conta...</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Minha conta</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus dados pessoais, empresa e senha.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Dados pessoais
          </h2>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={email} disabled />
            <p className="text-xs text-muted-foreground">
              O e-mail é usado para login e não pode ser alterado por aqui.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Rodrigo Bastos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (47) 99999-9999"
            />
          </div>

          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Salvando..." : "Salvar dados pessoais"}
          </Button>
        </section>

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Dados da empresa
          </h2>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Padaria Bom Pão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="Ex: 00.000.000/0001-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Alimentação, comércio, serviços..."
            />
          </div>

          <Button onClick={saveCompany} disabled={savingCompany}>
            {savingCompany ? "Salvando..." : "Salvar dados da empresa"}
          </Button>
        </section>

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Alterar senha
          </h2>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>

          <Button
            onClick={changePassword}
            disabled={changingPassword}
            variant="secondary"
          >
            {changingPassword ? "Alterando..." : "Alterar senha"}
          </Button>
        </section>

        <Separator className="my-8" />

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-destructive">
              Excluir conta
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Esta ação é permanente. Ao excluir sua conta, seus dados pessoais,
              empresa e cálculos salvos serão removidos do sistema.
            </p>
          </div>

          {!showDeleteAccount ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAccount(true)}
            >
              Excluir minha conta
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4">
              <div>
                <p className="font-medium text-destructive">
                  Tem certeza que deseja excluir sua conta?
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  Para confirmar, digite exatamente:
                  <strong> EXCLUIR MINHA CONTA</strong>
                </p>
              </div>

              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Digite a frase de confirmação"
              />

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteAccount(false)
                    setDeleteConfirmation("")
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  disabled={
                    deletingAccount ||
                    deleteConfirmation !== "EXCLUIR MINHA CONTA"
                  }
                >
                  {deletingAccount ? "Excluindo..." : "Confirmar exclusão"}
                </Button>
              </div>
            </div>
          )}
        </section>

        <Separator className="my-8" />

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            Voltar ao dashboard
          </Button>

          <Button variant="destructive" onClick={logout}>
            Sair da conta
          </Button>
        </div>
      </Card>
    </main>
  )
}