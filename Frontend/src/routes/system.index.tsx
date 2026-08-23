import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertCircle, Loader2, Moon, ShieldCheck, Sun } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { ROLE_LABEL } from "@/lib/permissions";

export const Route = createFileRoute("/system/")({
  head: () => ({
    meta: [{ title: "Staff Console — Gihanga Updates" }, { name: "robots", content: "noindex" }],
  }),
  component: StaffLoginPage,
});

function StaffLoginPage() {
  const navigate = useNavigate();
  const { signInStaff } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await api.post<any>("/system/auth/login", { email, password }, true);
      signInStaff(data.tokens, data.user);
      toast.success(`Welcome back, ${data.user.name}`, {
        description: `Signed in as ${ROLE_LABEL[data.user.role] ?? data.user.role}`,
      });
      navigate({ to: "/system/dashboard" });
    } catch (err: any) {
      setError(err?.message || "Invalid staff credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(0.62 0.13 205 / 0.16), transparent 42%), radial-gradient(circle at 80% 0%, oklch(0.7 0.13 190 / 0.14), transparent 45%), radial-gradient(circle at 50% 100%, oklch(0.55 0.12 250 / 0.12), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <button
        type="button"
        aria-label="Toggle theme"
        onClick={toggle}
        className="press absolute top-5 right-5 grid size-10 place-items-center rounded-xl border border-border bg-card/70 text-muted-foreground backdrop-blur"
      >
        {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Logo compact className="scale-125" />
          </motion.div>
          <div className="mt-2 flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <h1 className="font-display text-lg font-extrabold tracking-tight">Staff Console</h1>
          </div>
          <p className="text-sm text-muted-foreground">Moderator · Admin · Super Admin access only</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card/70 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="staff-email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Staff email
              </label>
              <input
                id="staff-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gihanga.rw"
                className="h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring"
              />
            </div>
            <div>
              <label htmlFor="staff-password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs text-danger"
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="gradient-brand flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Signing in…" : "Sign in to console"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Regular Gihanga Updates accounts can't sign in here — this console is for platform staff only.
        </p>
      </motion.div>
    </div>
  );
}
