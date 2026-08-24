import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, AtSign, Cake, Check, Loader2, Mail, Sparkles, User2, X } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, PasswordField, PasswordStrength, StepProgress } from "@/components/auth/AuthFields";
import { AuthDivider, SocialButtons } from "@/components/auth/SocialButtons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isEmail, passwordScore } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Gihanga Updates" },
      {
        name: "description",
        content:
          "Sign up for Gihanga Updates in three quick steps: your details, your handle, and your profile.",
      },
      { property: "og:title", content: "Create your account — Gihanga Updates" },
      {
        property: "og:description",
        content: "Join Gihanga Updates and start sharing stories, reels and updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const hues = [205, 235, 186, 250, 168, 196, 145, 220];
const TOTAL = 3;

function RegisterPage() {
  const navigate = useNavigate();
  const { signInConsumer } = useAuth();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [hue, setHue] = useState(205);
  const [bio, setBio] = useState("");
  const [isCreator, setIsCreator] = useState(true);
  type FieldErrors = {
    name?: string;
    email?: string;
    password?: string;
    username?: string;
    dob?: string;
  };
  const [errors, setErrors] = useState<FieldErrors>({});

  const [availability, setAvailability] = useState<"idle" | "checking" | "invalid" | "taken" | "free" | "error">(
    "idle"
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setAvailability("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
      setAvailability("invalid");
      return;
    }
    setAvailability("checking");
    const t = window.setTimeout(() => {
      api
        .get<{ username: string; status: "invalid" | "taken" | "free" }>(
          `/auth/check-username?username=${encodeURIComponent(clean)}`
        )
        .then((data) => setAvailability(data.status))
        // Network/server failure — distinct from "idle" so we don't silently
        // block the user with a misleading "pick an available handle" message
        // when their username was actually fine and the check just failed.
        .catch(() => setAvailability("error"));
    }, 500);
    return () => window.clearTimeout(t);
  }, [username]);

  function next() {
    const e: FieldErrors = {};
    if (step === 1) {
      if (name.trim().length < 2) e.name = "Tell us your name.";
      if (!isEmail(email)) e.email = "Enter a valid email address.";
      if (passwordScore(password) < 2) e.password = "Choose a stronger password.";
    }
    if (step === 2) {
      if (availability === "error")
        e.username = "Couldn't check that handle — check your connection and try again.";
      else if (availability !== "free") e.username = "Pick an available handle (3–20 letters, numbers or _).";
      if (!dob) e.dob = "Add your date of birth.";
      else if (new Date(dob) > new Date(Date.now() - 13 * 365.25 * 864e5))
        e.dob = "You must be at least 13 years old.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    if (step < TOTAL) {
      setDir(1);
      setStep((s) => s + 1);
      return;
    }

    setFormError(null);
    setBusy(true);
    api
      .post<any>("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password,
        avatarHue: hue,
        bio: bio.trim(),
        isCreator,
      })
      .then((data) => {
        signInConsumer(data.tokens, data.user);
        setBusy(false);
        // Email verification is temporarily skipped on account creation (see
        // backend consumerAuth.ts), so `data.user.emailVerified` is true
        // right away. Navigate straight into the app instead of routing
        // through /verify — going there first (even though it auto-redirects
        // once mounted) causes a visible flash of the verify-code screen
        // before bouncing onward, which we don't want users to see.
        if (data.user?.emailVerified) {
          toast.success("Account created", { description: "Welcome to Gihanga Updates!" });
          navigate({ to: data.user.onboarded ? "/" : "/interests" });
        } else if (data.emailSent === false) {
          toast.warning("Account created", {
            description: "We couldn't send the verification email right now — use \"Resend code\" on the next screen.",
          });
          navigate({ to: "/verify" });
        } else {
          toast.success("Account created", { description: "Check your email for a verification code." });
          navigate({ to: "/verify" });
        }
      })
      .catch((err: any) => {
        setBusy(false);
        const message = err?.message || "Registration failed. Please try again.";
        setFormError(message);
        toast.error(message);
        // If the server rejected the email/username, send the user back to fix it.
        if (/username/i.test(message)) {
          setStep(2);
        } else if (/email/i.test(message)) {
          setStep(1);
        }
      });
  }

  function back() {
    setDir(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  const initials =
    name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "G";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Three short steps and you're in."
      back={{ to: "/welcome", label: "Back to welcome" }}
    >
      <StepProgress step={step} total={TOTAL} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -34 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <AuthField
                  label="Full name"
                  icon={User2}
                  placeholder="Aline Mugisha"
                  autoComplete="name"
                  value={name}
                  error={errors.name}
                  onChange={(e) => setName(e.target.value)}
                />
                <AuthField
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  error={errors.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="space-y-2">
                  <PasswordField
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordStrength value={password} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <AuthField
                    label="Username"
                    icon={AtSign}
                    placeholder="yourhandle"
                    autoCapitalize="none"
                    value={username}
                    error={errors.username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    hint={
                      availability === "checking" ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="size-3 animate-spin" /> Checking availability…
                        </span>
                      ) : availability === "free" ? (
                        <span className="flex items-center gap-1.5 text-success">
                          <Check className="size-3" /> @{username} is available
                        </span>
                      ) : availability === "taken" ? (
                        <span className="flex items-center gap-1.5 text-danger">
                          <X className="size-3" /> @{username} is already taken
                        </span>
                      ) : availability === "invalid" ? (
                        "3–20 characters: letters, numbers or underscores."
                      ) : availability === "error" ? (
                        <span className="flex items-center gap-1.5 text-danger">
                          <X className="size-3" /> Couldn't check availability — retype to try again.
                        </span>
                      ) : (
                        "This is how people will find and mention you."
                      )
                    }
                  />
                </div>
                <AuthField
                  label="Date of birth"
                  icon={Cake}
                  type="date"
                  value={dob}
                  error={errors.dob}
                  onChange={(e) => setDob(e.target.value)}
                  hint="We never show this on your profile."
                />
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Account Type
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreator(false)}
                      className={cn(
                        "press rounded-2xl border p-3.5 text-left transition-all",
                        !isCreator
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-soft"
                          : "border-border bg-surface text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <User2 className="size-5 mb-1.5" />
                      <p className="text-sm font-bold text-foreground">Regular User</p>
                      <p className="text-[11px] font-normal text-muted-foreground leading-snug mt-0.5">
                        Watch reels, follow creators, comment, and save posts.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreator(true)}
                      className={cn(
                        "press rounded-2xl border p-3.5 text-left transition-all",
                        isCreator
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-soft"
                          : "border-border bg-surface text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Sparkles className="size-5 mb-1.5" />
                      <p className="text-sm font-bold text-foreground">Creator</p>
                      <p className="text-[11px] font-normal text-muted-foreground leading-snug mt-0.5">
                        Studio analytics, Go Live, Kingdom Points & cash payouts.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-muted/60 p-3.5">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-full font-display text-base font-bold text-primary-foreground"
                    style={{
                      backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${hue}), oklch(0.74 0.1 ${hue + 24}))`,
                    }}
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-sm">{name || "Your name"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{username || "yourhandle"} · {isCreator ? "Creator Account" : "Regular Account"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Avatar colour
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {hues.map((h) => (
                      <button
                        key={h}
                        type="button"
                        aria-label={`Avatar colour ${h}`}
                        onClick={() => setHue(h)}
                        className={cn(
                          "press grid size-9 place-items-center rounded-full",
                          hue === h && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                        )}
                        style={{
                          backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${h}), oklch(0.74 0.1 ${h + 24}))`,
                        }}
                      >
                        {hue === h && <Check className="size-4 text-primary-foreground" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="bio"
                    className="block text-xs font-bold tracking-wide text-muted-foreground uppercase"
                  >
                    Short bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Storyteller from Kigali. Building things that matter."
                    className="w-full resize-none rounded-2xl border border-border bg-surface/80 p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:shadow-glow"
                  />
                  <p className="text-right text-xs text-muted-foreground">{bio.length}/160</p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {formError && (
        <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger">{formError}</p>
      )}

      <div className="mt-6 flex gap-2.5">
        {step > 1 && (
          <Button variant="outline" size="lg" onClick={back} className="flex-1">
            <ArrowLeft />
            Back
          </Button>
        )}
        <Button variant="brand" size="lg" onClick={next} className="flex-[2]" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {step === TOTAL ? (busy ? "Creating account…" : "Create account") : "Continue"}
          {!busy && step < TOTAL && <ArrowRight />}
        </Button>
      </div>

      {step === 1 && (
        <>
          <AuthDivider />
          <SocialButtons mode="up" />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
