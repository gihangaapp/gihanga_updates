import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  Shield,
  ShieldCheck,
  Sun,
  User,
  UserPlus,
  AtSign,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import { useAuth, passwordScore, strengthLabels } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { useCreateStaff, useStaffSetupStatus } from "@/hooks/use-staff-management";
import { hasPermission, ROLE_LABEL } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/register")({
  head: () => ({
    meta: [
      { title: "Staff Registration — Gihanga Updates" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffRegisterPage,
});

type Role = "moderator" | "admin" | "superadmin";

interface RoleCardConfig {
  id: Role;
  title: string;
  badge: string;
  blurb: string;
  perks: string[];
  icon: typeof ShieldCheck;
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    id: "moderator",
    title: "Moderator",
    badge: "Safety",
    blurb: "First line of defense for community safety.",
    perks: ["Review reports and AI safety flags", "Escalate harmful live streams", "View relevant user account context"],
    icon: ShieldCheck,
  },
  {
    id: "admin",
    title: "Admin",
    badge: "Operations",
    blurb: "Full operational control of the platform.",
    perks: ["Manage platform users and content", "Review payments and ad campaigns", "View platform analytics"],
    icon: Shield,
  },
  {
    id: "superadmin",
    title: "Super Admin",
    badge: "Full Access",
    blurb: "Complete command including staff and settings.",
    perks: ["Everything an Admin can", "Create and manage staff", "Control platform settings and security"],
    icon: Crown,
  },
];

function StaffRegisterPage() {
  const navigate = useNavigate();
  const { staffUser, signInStaff } = useAuth();
  const { theme, toggle } = useTheme();
  const createStaff = useCreateStaff();
  const { data: setupStatus, isLoading: setupStatusLoading, isError: setupStatusError } = useStaffSetupStatus(!staffUser);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    bootstrapSecret: "",
    role: (staffUser ? "moderator" : "superadmin") as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isBootstrap = !staffUser && setupStatus?.setupAvailable === true;
  const canProvision = staffUser ? hasPermission(staffUser, "staff.create") : isBootstrap;

  const strength = passwordScore(form.password);
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(form.username);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passwordValid = form.password.length >= 8;
  const bootstrapSecretValid = !isBootstrap || form.bootstrapSecret.length >= 32;

  const canSubmit =
    form.name.trim().length >= 2 && usernameValid && emailValid && passwordValid && bootstrapSecretValid && !createStaff.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setTouched({ username: true, email: true, password: true, name: true });
      return;
    }
    try {
      const result = await createStaff.mutateAsync({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        ...(isBootstrap ? { bootstrapSecret: form.bootstrapSecret } : {}),
      });

      if (isBootstrap && result.tokens) {
        signInStaff(result.tokens, result.user);
        toast.success("Initial Super Admin account created", {
          description: `${result.user.name} (@${result.user.username}) is now signed in.`,
        });
        navigate({ to: "/system/dashboard" });
      } else {
        toast.success("Staff account created successfully", {
          description: `${result.user.name} (@${result.user.username}) registered as ${ROLE_LABEL[result.user.role]}.`,
        });
        navigate({ to: "/system/dashboard/staff" });
      }
    } catch (err: any) {
      setError(err?.message || "Couldn't register this administrator.");
    }
  }

  const strengthTone = useMemo(
    () => ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"][strength],
    [strength],
  );

  if ((!staffUser && setupStatusLoading) || (!staffUser && !setupStatus && !setupStatusError)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft">
          <Loader2 className="size-4 animate-spin text-primary" /> Checking secure staff setup…
        </div>
      </div>
    );
  }

  if (!canProvision) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-soft">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger"><Shield className="size-6" /></span>
          <h1 className="mt-4 font-display text-xl font-extrabold text-foreground">Staff registration unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {staffUser
              ? "Only the Super Admin can create staff accounts."
              : setupStatusError
                ? "We couldn't verify whether initial setup is available. Try again later or contact the platform owner."
                : "The initial Super Admin setup has already been completed. Sign in with an authorized staff account."}
          </p>
          <Link to="/system" className="press mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Go to staff sign in <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* ── Side panel (Desktop) ─────────────────────────────────────────── */}
      <div className="relative hidden w-[38%] max-w-[540px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(165deg, oklch(0.3 0.085 248), oklch(0.42 0.083 244) 46%, oklch(0.52 0.095 218))`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 85%, oklch(0.76 0.083 187 / 0.3), transparent 42%), radial-gradient(circle at 90% 15%, oklch(0.42 0.083 244 / 0.45), transparent 45%)",
          }}
        />
        <motion.div
          className="pointer-events-none absolute top-[22%] right-[14%] size-36 rounded-full opacity-20 blur-2xl"
          style={{ background: "oklch(0.76 0.083 187)" }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-3"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-white/12 p-1 backdrop-blur-md">
            <img src={logoImg} alt="Gihanga Updates" className="size-8 object-contain" />
          </span>
          <p className="font-display text-lg font-extrabold tracking-tight text-white">
            Gihanga Updates
          </p>
        </motion.div>

        <div className="relative space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-md">
              <UserPlus className="size-3.5" /> STAFF REGISTRATION
            </span>
            <h1 className="mt-5 font-display text-[32px] leading-[1.15] font-extrabold tracking-tight text-white xl:text-[36px]">
              Grow your
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, oklch(0.9 0.05 195), oklch(0.76 0.083 187) 60%, oklch(0.85 0.09 170))",
                }}
              >
                administration team.
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
              The first setup creates the single initial Super Admin. After setup, only an authorized Super Admin can add Moderators and Admins.
            </p>
          </motion.div>

          <div className="space-y-3">
            {ROLE_CARDS.filter((r) => isBootstrap ? r.id === "superadmin" : r.id !== "superadmin").map((r, i) => {
              const Icon = r.icon;
              const isSelected = form.role === r.id;
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: r.id }))}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.09 }}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer",
                    isSelected
                      ? "border-white/50 bg-white/20 shadow-lg scale-[1.02]"
                      : "border-white/15 bg-white/[0.06] hover:bg-white/12 hover:border-white/30",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors",
                      isSelected
                        ? "border-white/60 bg-white text-[oklch(0.42_0.083_244)] shadow-sm"
                        : "border-white/25 bg-white/10 text-white group-hover:bg-white/20",
                    )}
                  >
                    {isSelected ? <Check className="size-5 stroke-[2.5]" /> : <Icon className="size-5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{r.title}</p>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/90">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 line-clamp-1">{r.blurb}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="relative text-[11px] font-medium tracking-wide text-white/45">
          Role permissions follow the platform's RBAC matrix.
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, oklch(0.76 0.083 187 / 0.12), transparent 45%), radial-gradient(circle at 90% 85%, oklch(0.6 0.093 213 / 0.1), transparent 42%)",
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
          className="relative w-full max-w-[520px]"
        >
          <div className="mb-7 flex items-center gap-2 lg:hidden">
            <img src={logoImg} alt="" className="size-9 rounded-xl object-contain" />
            <div>
              <p className="font-display text-base leading-tight font-extrabold text-foreground">
                {isBootstrap ? "Initial Super Admin Setup" : "Register Staff Member"}
              </p>
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
                Gihanga Updates
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 p-7 shadow-float backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                  Create a staff account
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {isBootstrap
                    ? "Create the platform's first Super Admin account. This public setup closes after successful registration."
                    : "Provision a Moderator or Admin with role-scoped operational privileges."}
                </p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <UserPlus className="size-5" />
              </span>
            </div>

            {/* Active Session & Switch toggle (when already signed in) */}
            {staffUser && (
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground">
                Creating as <strong className="text-foreground">{staffUser.name}</strong>. Your current Super Admin session will remain active.
              </div>
            )}

            {/* Interactive Role Selector for ALL screen sizes */}
            <div className="mb-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Select Role
                </label>
                <span className="text-[11px] font-semibold text-primary">
                  {ROLE_LABEL[form.role]} Selected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {ROLE_CARDS.filter((r) => isBootstrap ? r.id === "superadmin" : r.id !== "superadmin").map((r) => {
                  const Icon = r.icon;
                  const isSelected = form.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: r.id }))}
                      className={cn(
                        "group relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-sm text-foreground"
                          : "border-border bg-elevated/70 text-muted-foreground hover:border-primary/40 hover:bg-card hover:text-foreground",
                      )}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span
                        className={cn(
                          "mb-1.5 grid size-9 place-items-center rounded-xl transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary",
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <p className="text-xs font-bold leading-tight">{r.title}</p>
                      <span className="mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-75">
                        {r.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic perks list */}
              <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary">
                    {ROLE_LABEL[form.role]} Scope:
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {ROLE_CARDS.find((r) => r.id === form.role)?.blurb}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {ROLE_CARDS.find((r) => r.id === form.role)?.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-foreground/85">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {isBootstrap && (
                <div>
                  <label htmlFor="bootstrap-secret" className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    One-time setup secret
                  </label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="bootstrap-secret"
                      type="password"
                      required
                      minLength={32}
                      autoComplete="off"
                      value={form.bootstrapSecret}
                      onChange={(e) => setForm({ ...form, bootstrapSecret: e.target.value })}
                      placeholder="Enter STAFF_BOOTSTRAP_SECRET from backend environment"
                      className="h-12 w-full rounded-xl border border-border bg-elevated pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">The platform owner must first configure a random secret of at least 32 characters in the backend environment. It is never stored in the user account.</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Full name
                  </label>
                  <div className="group relative">
                    <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      required
                      minLength={2}
                      maxLength={64}
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="Jane Uwase"
                      className={cn(
                        "h-11 w-full rounded-xl border bg-elevated pr-3.5 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10",
                        touched["name"] && form.name.trim().length < 2 ? "border-danger/60" : "border-border",
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Username
                  </label>
                  <div className="group relative">
                    <AtSign className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]{3,20}"
                      autoComplete="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                      placeholder="jane_uwase"
                      className={cn(
                        "h-11 w-full rounded-xl border bg-elevated pr-3.5 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10",
                        touched["username"] && !usernameValid ? "border-danger/60" : "border-border",
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Work email
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="jane@gihanga.rw"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-elevated pr-4 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10",
                      touched["email"] && !emailValid ? "border-danger/60" : "border-border",
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Temporary password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Minimum 8 characters"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-elevated pr-11 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10",
                      touched["password"] && !passwordValid ? "border-danger/60" : "border-border",
                    )}
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

                {form.password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            i < strength ? strengthTone : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
                      Strength: <span className="text-foreground">{strengthLabels[strength]}</span> —
                      mix letters, numbers & symbols
                    </p>
                  </div>
                )}
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
                disabled={!canSubmit}
                className="press gradient-brand flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60 cursor-pointer"
              >
                {createStaff.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {createStaff.isPending
                  ? "Creating account…"
                  : `Register ${ROLE_LABEL[form.role]}`}
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link
              to="/system"
              className="press group flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to staff sign-in
            </Link>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <ShieldCheck className="size-3" />
              {isBootstrap
                ? "You will be signed in to the initial Super Admin account after setup."
                : "The new staff member receives separate credentials; your Super Admin session remains active."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
