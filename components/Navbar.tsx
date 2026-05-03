"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  DollarSign,
  Percent,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const currentStepIndex = steps.findIndex(
    (step) =>
      pathname === step.path ||
      (step.altPaths && step.altPaths.includes(pathname)),
  );

  const isHome = pathname === "/";

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
        </nav>
      </div>
    </>
  );
}

