import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { AuthBackdrop } from "@/components/auth/AuthLayout";
import { SocialButtons, AuthDivider } from "@/components/auth/SocialButtons";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Gihanga Updates — Join the Creators" },
      {
        name: "description",
        content:
          "Create your Gihanga Updates account to follow creators, share stories and reels, and join the conversation across Rwanda.",
      },
      { property: "og:title", content: "Welcome to Gihanga Updates — Join the Creators" },
      {
        property: "og:description",
        content: "Create your account and join thousands of creators on Gihanga Updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const highlights = [
  { icon: Sparkles, title: "A feed with taste", body: "For you, Following and Trending — no noise." },
  { icon: Flame, title: "Stories & reels", body: "Go live, post vertical, keep the room warm." },
  { icon: Users, title: "Creator tools", body: "Drafts, scheduling and payouts in RWF." },
  { icon: ShieldCheck, title: "Safety first", body: "Granular controls over who sees what." },
];

function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already signed in, go straight to the right place (AppShell will also
  // enforce this, but avoid a flash of the welcome screen first).
  useEffect(() => {
    if (loading || !user) return;
    if (!user.emailVerified) navigate({ to: "/verify" });
    else if (!user.onboarded) navigate({ to: "/interests" });
    else navigate({ to: "/" });
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <AuthBackdrop />

      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex">
        <div className="gradient-brand pointer-events-none absolute -top-32 -left-24 size-[420px] rounded-full opacity-30 blur-3xl" />
        <div className="halo pointer-events-none absolute -right-32 bottom-0 size-[480px] rounded-full opacity-40 blur-3xl" />

        <Logo />

        <div className="relative max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[46px] leading-[1.05] font-extrabold tracking-tight"
          >
            The place where <span className="text-gradient-brand">Rwanda</span> posts.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-[15px] text-muted-foreground"
          >
            Stories, reels and updates from the creators shaping culture — with the tools to build
            an audience and get paid for it in RWF.
          </motion.p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.14 + i * 0.06 }}
                className="glass rounded-2xl p-4"
              >
                <h.icon className="size-5 text-primary" />
                <p className="mt-2.5 text-sm font-bold">{h.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{h.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Built for creators and viewers across East Africa.
          </p>
        </div>
      </section>

      {/* Action panel */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight">Get started</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account in under a minute. Free, always.
          </p>

          <div className="mt-7 space-y-2.5">
            <Button variant="brand" size="lg" className="w-full" asChild>
              <Link to="/register">Create account</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>

          <AuthDivider label="or continue with" />
          <SocialButtons mode="up" />

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to our Terms of Service and acknowledge our Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
}
