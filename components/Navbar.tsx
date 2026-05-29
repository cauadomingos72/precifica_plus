"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  DollarSign,
  Percent,
  BarChart3,
  ChevronRight,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { id: "cadastro", label: "Cadastro", path: "/produtos", icon: Package },
  {
    id: "custos",
    label: "Custos",
    path: "/custos-diretos",
    icon: DollarSign,
    altPaths: ["/custos-indiretos"],
  },
  { id: "margem", label: "Margem", path: "/margem", icon: Percent },
  { id: "resultado", label: "Resultado", path: "/resultado", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccountOpen(false);
    router.push("/login");
    router.refresh();
  };

  const currentStepIndex = steps.findIndex(
    (step) =>
      pathname === step.path ||
      (step.altPaths && step.altPaths.includes(pathname))
  );

  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isSales = pathname === "/vendas";

  return (
    <>
      <div className="h-20 sm:h-24 w-full print:hidden" aria-hidden="true" />

      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full px-3 sm:px-6 print:hidden">
        <nav className="mx-auto w-full max-w-[1120px] bg-primary/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-full py-2 px-4 sm:px-6 flex items-center justify-between gap-3 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className={cn(
                "flex items-center justify-center rounded-full transition-colors flex-shrink-0",
                isHome
                  ? "bg-secondary text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              title="Página Inicial"
            >
              <img
                src="/logo_dark.png"
                alt="Precifica+"
                className="h-10 sm:h-11 w-auto max-w-[145px] object-contain flex-shrink-0"
              />
            </Link>

            <div className="w-px h-6 bg-white/10 hidden sm:block flex-shrink-0" />

            <div className="hidden sm:flex items-center gap-1 min-w-0">
              {steps.map((step, index) => {
                const isActive =
                  pathname === step.path ||
                  (step.altPaths && step.altPaths.includes(pathname));

                const isPast = currentStepIndex > index;
                const isAccessible = isActive || isPast;

                return (
                  <div key={step.id} className="flex items-center">
                    <Link
                      href={isAccessible ? step.path : "#"}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap",
                        isActive
                          ? "bg-secondary text-white shadow-lg shadow-secondary/20 scale-105"
                          : isPast
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "text-white/35 cursor-not-allowed pointer-events-none"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <step.icon
                        className={cn(
                          "size-4",
                          isActive ? "animate-pulse" : ""
                        )}
                      />

                      <span
                        className={cn(
                          "hidden lg:inline",
                          isActive ? "md:inline" : "",
                          isHome ? "hidden" : ""
                        )}
                      >
                        {step.label}
                      </span>
                    </Link>

                    {index < steps.length - 1 && (
                      <ChevronRight className="size-3 text-white/10 mx-0.5 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap",
                    isDashboard
                      ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>

                <Link
                  href="/vendas"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap",
                    isSales
                      ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <ShoppingCart className="size-4" />
                  <span className="hidden md:inline">Vendas</span>
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    <User className="size-4" />
                    <span className="hidden md:inline">Conta</span>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-10 w-44 rounded-xl bg-white shadow-xl border border-black/5 p-2">
                      <Link
                        href="/conta"
                        onClick={() => setAccountOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Editar conta
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="size-4" />
                        Sair da conta
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-white shadow-lg shadow-secondary/20 text-sm font-medium whitespace-nowrap"
              >
                <User className="size-4" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}