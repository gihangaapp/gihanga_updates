import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="halo absolute -top-40 -left-32 size-[520px] rounded-full opacity-50 blur-3xl" />
      <div className="gradient-brand absolute -right-40 -bottom-52 size-[560px] rounded-full opacity-25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent,var(--color-background)_72%)]" />
    </div>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
  back,
  wide,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  back?: { to: string; label: string };
  wide?: boolean;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuthBackdrop />

      <header className="relative z-10 flex items-center gap-3 px-4 py-5 sm:px-8">
        {back ? (
          <Button variant="ghost" size="icon-sm" aria-label={back.label} asChild>
            <Link to={back.to}>
              <ArrowLeft />
            </Link>
          </Button>
        ) : null}
        <Link to="/welcome" className="press">
          <Logo />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "glass w-full rounded-3xl p-6 shadow-float sm:p-8",
            wide ? "max-w-2xl" : "max-w-md",
          )}
        >
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
