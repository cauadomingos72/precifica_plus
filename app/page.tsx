import Link from "next/link";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">
        Precifica+
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold mb-3 text-secondary">
            Bem-vindo
          </h2>
          <p className="text-muted-foreground">
            Uma ferramenta de precificação inteligente para micro e pequenas
            empresas.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-3 text-secondary">
            Fluxo do sistema
          </h2>
          <p className="text-muted-foreground">
            Cadastro → Custos → Margem → Cálculo → Resultado → Decisão.
          </p>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Link href="/produtos">
          <Button size="lg" className="px-8 py-6 text-lg">
            Começar
          </Button>
        </Link>
      </div>
    </main>
  );
}

