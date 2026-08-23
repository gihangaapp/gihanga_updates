import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField, PasswordStrength } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";
import { passwordScore } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? (search["token"] as string) : "",
    email: typeof search["email"] === "string" ? (search["email"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — Gihanga Updates" },
      {
        name: "description",
        content: "Choose a new password for your Gihanga Updates account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is missing information."
        back={{ to: "/forgot-password", label: "Request a new link" }}
      >
        <div className="flex items-start gap-3 rounded-2xl bg-danger/10 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" />
          <p className="text-sm text-foreground/80">
            Open this page from the link in the password reset email, or request a new one.
          </p>
        </div>
        <Button variant="brand" size="lg" className="mt-5 w-full" asChild>
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="You can now sign in with your new password."
        back={{ to: "/login", label: "Back to sign in" }}
      >
        <div className="flex items-start gap-3 rounded-2xl bg-primary-soft p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-foreground/80">Your password has been reset successfully.</p>
        </div>
        <Button variant="brand" size="lg" className="mt-5 w-full" onClick={() => navigate({ to: "/login" })}>
          Sign in
        </Button>
      </AuthLayout>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordScore(password) < 2) {
      setError("Choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(undefined);
    setBusy(true);
    api
      .post("/auth/reset-password", { token, email, password })
      .then(() => {
        setBusy(false);
        setDone(true);
        toast.success("Password reset");
      })
      .catch((err: any) => {
        setBusy(false);
        setError(err?.message || "This reset link is invalid or has expired.");
      });
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={`Choose a new password for ${email}.`}
      back={{ to: "/login", label: "Back to sign in" }}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <PasswordField
            label="New password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength value={password} />
        </div>
        <PasswordField
          label="Confirm password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirm}
          error={error}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
