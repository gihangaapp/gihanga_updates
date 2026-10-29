import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserPlus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import { Logo } from "@/components/common/Logo";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { ROLE_LABEL } from "@/lib/permissions";

export const Route = createFileRoute("/system/")({
  head: () => ({
    meta: [{ title: "Admin Console — Gihanga Updates" }, { name: "robots", content: "noindex" }],
  }),
  component: StaffLoginPage,
});

const highlights = [
  {
    icon: ShieldCheck,
    title: "Role-based control",
    text: "Separate consoles for Super Admins, Admins and Moderators.",
  },
  {
    icon: Zap,
    title: "Real-time oversight",
    text: "Live moderation queues, streams and payments as they happen.",
  },
  {
    icon: Sparkles,
    title: "Smart insights",
    text: "Growth analytics and AI-assisted safety review built in.",
  },
];

function StaffLoginPage() {
  const navigate = useNavigate();
  const { signInStaff, staffUser } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
    <div className="relative flex min-h-screen bg-background">
      {/* ── Brand panel ─────────────────────────────────────────────────── */}
      <div className="relative hidden w-[46%] max-w-[640px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        {/* Ocean Deep gradient canvas */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(160deg, oklch(0.32 0.09 245), oklch(0.42 0.083 244) 42%, oklch(0.5 0.095 220) 74%, oklch(0.6 0.093 213))`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 12%, oklch(0.76 0.083 187 / 0.35), transparent 40%), radial-gradient(circle at 85% 78%, oklch(0.42 0.083 244 / 0.5), transparent 46%), radial-gradient(circle at 55% 105%, oklch(0.6 0.093 213 / 0.4), transparent 42%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="pointer-events-none absolute top-[16%] right-[12%] size-40 rounded-full opacity-25 blur-2xl"
          style={{ background: "oklch(0.76 0.083 187)" }}
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[12%] left-[8%] size-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.42 0.083 244)" }}
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white/12 p-1 backdrop-blur-md">
            <img src={logoImg} alt="Gihanga Updates" className="size-9 object-contain" />
          </span>
          <div>
            <p className="font-display text-lg leading-tight font-extrabold tracking-tight text-white">
              Gihanga Updates
            </p>
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">
              Administration
            </p>
          </div>
        </motion.div>

        <div className="relative space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-md">
              <Fingerprint className="size-3.5" /> STAFF ACCESS ONLY
            </span>
            <h1 className="mt-5 font-display text-[34px] leading-[1.12] font-extrabold tracking-tight text-white xl:text-[40px]">
              Command center for the
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.9 0.05 195), oklch(0.76 0.083 187) 60%, oklch(0.85 0.09 170))" }}
              >
                Gihanga community.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              Moderate content, manage accounts, oversee payments and watch the platform grow —
              all from one beautifully calm console.
            </p>
          </motion.div>

          <div className="space-y-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.1 }}
                className="flex items-start gap-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md">
                  <h.icon className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{h.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-white/65">{h.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative text-[11px] font-medium tracking-wide text-white/45"
        >
          © {new Date().getFullYear()} Gihanga Updates · Ocean Deep Administration Suite
        </motion.p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, oklch(0.76 0.083 187 / 0.12), transparent 45%), radial-gradient(circle at 10% 90%, oklch(0.6 0.093 213 / 0.1), transparent 42%)",
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
          {/* Mobile brand header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <Logo compact className="scale-125" />
            <div className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              <h1 className="font-display text-lg font-extrabold tracking-tight">Admin Console</h1>
            </div>
            <p className="text-sm text-muted-foreground">Moderator · Admin · Super Admin access</p>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 p-7 shadow-float backdrop-blur-xl sm:p-8">
            <div className="mb-6 hidden items-center gap-2 text-foreground lg:flex">
              <ShieldCheck className="size-4 text-primary" />
              <h2 className="font-display text-lg font-extrabold tracking-tight">Sign in to console</h2>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label
                  htmlFor="staff-email"
                  className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase"
                >
                  Staff email
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    id="staff-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gihanga.rw"
                    className="h-12 w-full rounded-xl border border-border bg-elevated pr-4 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="staff-password"
                    className="block text-xs font-bold tracking-wide text-muted-foreground uppercase"
                  >
                    Password
                  </label>
                </div>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-border bg-elevated pr-11 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="press absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted-foreground select-none">
                  <span
                    onClick={() => setRemember(!remember)}
                    className={`grid size-4.5 place-items-center rounded-md border transition-colors ${
                      remember ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-elevated"
                    }`}
                  >
                    {remember && (
                      <svg viewBox="0 0 12 12" className="size-3" fill="none">
                        <path
                          d="M2.5 6.5L5 9l4.5-5.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  Keep me signed in
                </label>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0, x: [0, -6, 6, -3, 3, 0] }}
                  transition={{ duration: 0.45 }}
                  className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-xs font-semibold text-danger"
                >
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="press gradient-brand relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {!busy && (
                  <motion.span
                    className="absolute inset-0 bg-white/15"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                )}
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                <span className="relative">{busy ? "Verifying credentials…" : "Sign in to console"}</span>
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Link
              to="/system/register"
              className="press group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <UserPlus className="size-4 text-primary" />
              Register an administrator
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Regular Gihanga Updates accounts can't sign in here — this console is reserved for
            platform staff. {staffUser ? "You already have an active staff session." : ""}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
