import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { confirmation } = await request.json()

    if (confirmation !== "EXCLUIR MINHA CONTA") {
      return NextResponse.json(
        { error: "Frase de confirmação inválida." },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Variáveis de ambiente do Supabase não configuradas." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 }
      )
    }

    const adminSupabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    await adminSupabase
      .from("calculations")
      .delete()
      .eq("user_id", user.id)

    await adminSupabase
      .from("companies")
      .delete()
      .eq("user_id", user.id)

    await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", user.id)

    const { error: deleteUserError } =
      await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao excluir conta." },
      { status: 500 }
    )
  }
}