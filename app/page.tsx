import Link from "next/link";
import Card from "@/components/Card";

export default function Home() {
  return (
    <main className="container">
      <h1 className="title">Precifica+ 💰</h1>

      <Card>
        <h2 className="subtitle">Bem-vindo</h2>
        <p>
          Uma ferramenta de precificação inteligente para micro e pequenas empresas.
        </p>
      </Card>

      <Card>
        <h2 className="subtitle">Fluxo do sistema</h2>
        <p>
          Cadastro → Custos → Margem → Cálculo → Dashboard → Decisão.
        </p>
      </Card>

      <Link href="/produtos">
        <button className="button">Começar</button>
      </Link>
    </main>
  );
}