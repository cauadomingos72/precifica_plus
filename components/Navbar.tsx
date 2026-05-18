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
      (step.altPaths && step.altPaths.includes(pathname)),
  );

  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <div className="h-20 sm:h-24 w-full print:hidden" aria-hidden="true" />

      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 print:hidden">
        <nav className="bg-primary/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-full py-1.5 px-3 sm:px-6 flex items-center gap-2 sm:gap-4 transition-all duration-300">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-full transition-colors",
              isHome
                ? "bg-secondary text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/5",
            )}
            title="Página Inicial"
          >
            <img
              src="/logo_dark.png"
              alt="Logo"
              className="h-12 object-contain"
            />
          </Link>

          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-0.5 sm:gap-1">
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
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all text-[10px] sm:text-xs font-medium whitespace-nowrap",
                      isActive
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20 scale-105"
                        : isPast
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-white/30 cursor-not-allowed pointer-events-none",
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <step.icon
                      className={cn(
                        "size-3.5 sm:size-4",
                        isActive ? "animate-pulse" : "",
                      )}
                    />

                    <span
                      className={cn(
                        "hidden",
                        isActive ? "inline" : "md:inline",
                        isHome ? "hidden" : "",
                      )}
                    >
                      {step.label}
                    </span>
                  </Link>

                  {index < steps.length - 1 && (
                    <ChevronRight className="size-3 text-white/10 mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-2 relative">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap",
                  isDashboard
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">Conta</span>
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
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-white shadow-lg shadow-secondary/20 text-xs font-medium whitespace-nowrap"
            >
              <User className="size-4" />
              <span>Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}