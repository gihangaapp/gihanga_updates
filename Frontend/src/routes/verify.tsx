import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify your email — Gihanga Updates" },
      {
        name: "description",
        content:
          "Enter the 6-digit code we sent to your email to confirm your Gihanga Updates account.",
      },
      { property: "og:title", content: "Verify your email — Gihanga Updates" },
      {
        property: "og:description",
        content: "Confirm your email with a 6-digit code to finish setting up your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

const LENGTH = 6;

function VerifyPage() {
  const navigate = useNavigate();
  const { user, updateConsumerProfile } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(42);
  const [resending, setResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Already verified (e.g. reloaded this page after verifying) — move on.
    if (user?.emailVerified) {
      navigate({ to: user.onboarded ? "/" : "/interests" });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const code = digits.join("");

  function setAt(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, idx) => (idx === i ? "" : x)));
      return;
    }
    setDigits((d) => {
      const next = [...d];
      clean.split("").forEach((ch, k) => {
        if (i + k < LENGTH) next[i + k] = ch;
      });
      return next;
    });
    const target = Math.min(i + clean.length, LENGTH - 1);
    refs.current[target]?.focus();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < LENGTH) {
      setError("Enter all six digits.");
      return;
    }
    setError(null);
    setBusy(true);
    api
      .post<{ user: any }>("/auth/verify-email", { code })
      .then((data) => {
        setBusy(false);
        updateConsumerProfile(data.user);
        toast.success("Email verified", { description: "Let's tune your feed." });
        navigate({ to: data.user.onboarded ? "/" : "/interests" });
      })
      .catch((err: any) => {
        setBusy(false);
        setError(err?.message || "That code didn't work. Please try again.");
      });
  }

  function resend() {
    setResending(true);
    api
      .post("/auth/resend-verification")
      .then(() => {
        setSeconds(42);
        toast.success("New code sent", { description: "Check your inbox." });
      })
      .catch((err: any) => {
        toast.error(err?.message || "Couldn't resend the code. Try again shortly.");
      })
      .finally(() => setResending(false));
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${user?.email || "your inbox"}. It expires in 10 minutes.`}
      back={{ to: "/register", label: "Back to sign up" }}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="flex justify-between gap-2" onPaste={(e) => {
          e.preventDefault();
          setAt(0, e.clipboardData.getData("text"));
        }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${i + 1}`}
              maxLength={LENGTH}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
                if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
                if (e.key === "ArrowRight" && i < LENGTH - 1) refs.current[i + 1]?.focus();
              }}
              className={cn(
                "h-14 w-full rounded-2xl border border-border bg-surface/80 text-center font-display text-xl font-bold outline-none transition-all",
                "focus:border-ring focus:shadow-glow",
                error && "border-danger",
              )}
            />
          ))}
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          {busy ? "Verifying…" : "Verify and continue"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {seconds > 0 ? (
            <>Resend code in {seconds}s</>
          ) : (
            <button
              type="button"
              className="font-semibold text-primary hover:underline disabled:opacity-60"
              onClick={resend}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
