import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";
import { isEmail } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Gihanga Updates" },
      {
        name: "description",
        content:
          "Forgot your Gihanga Updates password? Enter your email and we'll send you a reset link.",
      },
      { property: "og:title", content: "Reset your password — Gihanga Updates" },
      {
        property: "og:description",
        content: "Request a password reset link for your Gihanga Updates account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setBusy(true);
    api
      .post("/auth/forgot-password", { email: email.trim() })
      .then(() => {
        setBusy(false);
        setSent(true);
      })
      .catch((err: any) => {
        setBusy(false);
        // Backend intentionally returns the same generic message either way,
        // so a request failure here is a real network/server problem.
        setError(err?.message || "Something went wrong. Please try again.");
      });
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`If an account exists for ${email}, a reset link is on its way.`}
        back={{ to: "/login", label: "Back to sign in" }}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-primary-soft p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground/80">
              The link expires in 30 minutes. Didn't get it? Check spam, then try again.
            </p>
          </div>
          <Button variant="outline" size="lg" className="w-full" onClick={() => setSent(false)}>
            Use a different email
          </Button>
          <Button variant="brand" size="lg" className="w-full" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new one."
      back={{ to: "/login", label: "Back to sign in" }}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={error}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {busy ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
