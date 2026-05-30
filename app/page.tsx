import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  Gauge,
  Lightbulb,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#F7FAFC] to-white">
      <section className="container mx-auto px-4 pt-10 pb-20 max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border bg-white/80 px-6 py-16 shadow-sm md:px-12">
          <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute right-8 top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-20 top-20 hidden h-40 w-72 opacity-30 md:block">
            <svg viewBox="0 0 300 160" className="h-full w-full">
              <path
                d="M10 130 C60 90, 80 110, 120 70 S180 50, 210 35 S250 20, 290 8"
                fill="none"
                stroke="#1FAF9A"
                strokeWidth="3"
              />
              <circle cx="120" cy="70" r="6" fill="#1FAF9A" />
              <circle cx="210" cy="35" r="6" fill="#1FAF9A" />
              <circle cx="290" cy="8" r="6" fill="#1FAF9A" />
            </svg>
          </div>

          <div className="relative text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
              <Sparkles className="h-4 w-4" />
              Plataforma de precificação inteligente
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
              Bem-vindo ao Precifica+
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              A plataforma inteligente que transforma números em decisões mais
              lucrativas para sua empresa.
            </p>
          </div>

          <div className="relative mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Rocket className="h-11 w-11" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-secondary">
                    Bem-vindo
                  </h2>

                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Uma ferramenta de precificação inteligente para micro e
                    pequenas empresas.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
                    <CheckCircle2 className="h-4 w-4" />
                    Simples, rápida e eficiente
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-11 w-11" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-secondary">
                    Fluxo do sistema
                  </h2>

                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Cadastro <span className="mx-2 text-primary">›</span>
                    Custos <span className="mx-2 text-primary">›</span>
                    Margem <span className="mx-2 text-primary">›</span>
                    Cálculo <span className="mx-2 text-primary">›</span>
                    Resultado <span className="mx-2 text-primary">›</span>
                    Decisão
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <BarChart3 className="h-4 w-4" />
                    Do cadastro à decisão final
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-10 flex flex-col items-center gap-4">
            <Link href="/produtos">
              <Button size="lg" className="px-10 py-6 text-base">
                Começar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Seguro, confiável e feito para o seu negócio
            </p>
          </div>

          <div className="relative mt-14 grid gap-5 rounded-[1.5rem] border bg-white p-6 shadow-sm md:grid-cols-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <Target className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-primary">Preciso</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cálculos confiáveis para precificação assertiva.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <Zap className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-primary">Rápido</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Agilidade para tomar decisões todos os dias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <BarChart3 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-primary">Estratégico</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mais controle, mais lucro e mais crescimento.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-primary">Seguro</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seus dados protegidos com tecnologia de ponta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary mb-6">
              Sobre nós
            </span>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
              Transformamos números em decisões mais lucrativas.
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              O Precifica+ foi criado para ajudar micro e pequenos
              empreendedores a precificar com segurança, ter mais controle sobre
              seus custos e aumentar seus resultados.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                  <Gauge className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-primary">
                    Simples de usar
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fluxo guiado em etapas claras.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                  <Brain className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-primary">Inteligente</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dados transformados em análise.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-primary">
                    Focado no lucro
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Decisões com base em resultado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -right-4 h-36 w-36 rounded-full bg-secondary/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-4 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border bg-white p-3 shadow-2xl">
              <Image
                src="/hero-home1.png"
                alt="Empreendedora utilizando tablet com indicadores de precificação"
                width={1122}
                height={1402}
                priority
                className="h-auto w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-white/70">
        <div className="container mx-auto px-4 py-20 max-w-6xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-secondary">
            Nossa missão
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-primary max-w-3xl mx-auto">
            Ajudar empreendedores a crescerem com preços justos e lucrativos.
          </h2>

          <p className="mt-5 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Acreditamos que precificar corretamente não é apenas colocar um
            número em um produto ou serviço. É garantir a sustentabilidade do
            negócio, valorizar o seu trabalho e ter liberdade para crescer.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-wider text-secondary">
            O que entregamos
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-primary">
            Recursos para decidir melhor
          </h2>

          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            O Precifica+ organiza os principais pontos da formação de preço para
            tornar o processo mais claro, rápido e confiável.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 inline-flex rounded-2xl bg-secondary/10 p-4 text-secondary">
              <Calculator className="h-7 w-7" />
            </div>

            <h3 className="font-bold text-primary text-lg">
              Cálculo preciso de custos
            </h3>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Tenha clareza total sobre todos os custos envolvidos no seu
              produto ou serviço.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 inline-flex rounded-2xl bg-secondary/10 p-4 text-secondary">
              <DollarSign className="h-7 w-7" />
            </div>

            <h3 className="font-bold text-primary text-lg">
              Definição de margem de lucro
            </h3>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Escolha a margem ideal para seu negócio e acompanhe seus
              objetivos.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 inline-flex rounded-2xl bg-secondary/10 p-4 text-secondary">
              <Lightbulb className="h-7 w-7" />
            </div>

            <h3 className="font-bold text-primary text-lg">
              Formação de preço de venda
            </h3>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Receba sugestões de preço com base em dados reais e confiáveis.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 inline-flex rounded-2xl bg-secondary/10 p-4 text-secondary">
              <BarChart3 className="h-7 w-7" />
            </div>

            <h3 className="font-bold text-primary text-lg">
              Apoio à tomada de decisão
            </h3>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Visualize o impacto das suas escolhas e decida com mais
              segurança.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 inline-flex rounded-2xl bg-secondary/10 p-4 text-secondary">
              <Clock className="h-7 w-7" />
            </div>

            <h3 className="font-bold text-primary text-lg">
              Processo rápido e intuitivo
            </h3>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Uma experiência simples, prática e feita para o seu dia a dia.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-center rounded-[2rem] bg-gradient-to-br from-secondary/10 via-white to-primary/5 border p-8 md:p-12">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-secondary/20 blur-2xl" />

              <div className="relative h-56 w-56 rounded-full border border-secondary/20 bg-white flex items-center justify-center shadow-xl">
                <div className="h-36 w-36 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="h-20 w-20" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-secondary">
              Confiança e segurança
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-primary max-w-2xl">
              Seus dados estão seguros e sua privacidade é prioridade.
            </h2>

            <p className="mt-5 text-muted-foreground leading-relaxed max-w-2xl">
              Utilizamos tecnologia para proteger as informações da sua empresa.
              Você pode focar no que importa: fazer seu negócio crescer.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-secondary shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">
                    Ambiente seguro
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Acesso protegido por login.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">
                    Dados preservados
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Informações vinculadas à sua conta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-secondary shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Privacidade</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Controle sobre seus registros.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/produtos">
                <Button size="lg" className="px-7 py-6 text-base">
                  Começar minha precificação
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}