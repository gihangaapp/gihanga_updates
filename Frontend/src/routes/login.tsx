import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, PasswordField } from "@/components/auth/AuthFields";
import { AuthDivider, SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { useAuth, isEmail } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Gihanga Updates" },
      {
        name: "description",
        content:
          "Sign in to Gihanga Updates to pick up your feed and creator dashboard where you left off.",
      },
      { property: "og:title", content: "Sign in — Gihanga Updates" },
      {
        property: "og:description",
        content: "Sign in to your Gihanga Updates account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signInConsumer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isStaffNotice, setIsStaffNotice] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsStaffNotice(false);
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const data = await api.post<any>("/auth/login", { email, password });
      signInConsumer(data.tokens, data.user);
      if (!data.user.emailVerified) {
        toast("Verify your email to continue", { description: "We sent you a code when you signed up." });
        navigate({ to: "/verify" });
      } else {
        toast.success("Welcome back", { description: "You're signed in to Gihanga Updates." });
        navigate({ to: data.user.onboarded ? "/" : "/interests" });
      }
    } catch (err: any) {
      const message: string = err?.message || "Sign in failed. Please try again.";
      if (message.includes("/system") || message.includes("Staff")) {
        setIsStaffNotice(true);
        setErrors({ form: "Staff accounts must log in through the internal staff portal." });
      } else {
        setErrors({ form: message });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Your feed, your creators, exactly where you left it."
      back={{ to: "/welcome", label: "Back to welcome" }}
    >
      {errors.form && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-danger/10 border border-danger/20 p-3.5 text-xs font-semibold text-danger">
          <span className="flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            {errors.form}
          </span>
          {isStaffNotice && (
            <Link to="/system" className="underline font-bold hover:opacity-80">
              Go to /system
            </Link>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 accent-primary"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {busy ? "Signing you in…" : "Sign in"}
        </Button>
      </form>

      <AuthDivider />
      <SocialButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
