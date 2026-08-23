import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/auth/AuthFields";
import { interestTopics } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interests")({
  head: () => ({
    meta: [
      { title: "Pick your interests — Gihanga Updates" },
      {
        name: "description",
        content:
          "Choose the topics you care about so your Gihanga Updates feed feels right from day one.",
      },
      { property: "og:title", content: "Pick your interests — Gihanga Updates" },
      {
        property: "og:description",
        content: "Tune your Gihanga Updates feed by picking topics you care about.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterestsPage,
});

const MIN = 3;

function InterestsPage() {
  const navigate = useNavigate();
  const { updateConsumerProfile } = useAuth();
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = (topic: string) =>
    setPicked((p) => (p.includes(topic) ? p.filter((t) => t !== topic) : [...p, topic]));

  function finish() {
    setBusy(true);
    api
      .patch<{ user: any }>("/auth/me", { interests: picked, onboarded: true })
      .then((data) => {
        updateConsumerProfile(data.user);
        setBusy(false);
        toast.success("Your feed is ready", { description: `${picked.length} topics selected.` });
        navigate({ to: "/" });
      })
      .catch((err: any) => {
        setBusy(false);
        toast.error(err?.message || "Couldn't save your interests. Please try again.");
      });
  }

  return (
    <AuthLayout
      wide
      title="What are you into?"
      subtitle={`Pick at least ${MIN} topics — we'll shape your For You feed around them.`}
      back={{ to: "/verify", label: "Back to verification" }}
    >
      <StepProgress step={1} total={1} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="topics"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-5">
            {interestTopics.map((group) => (
              <div key={group.category}>
                <p className="mb-2.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.topics.map((topic) => {
                    const on = picked.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(topic)}
                        className={cn(
                          "press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold",
                          on
                            ? "gradient-brand border-transparent text-primary-foreground shadow-glow"
                            : "border-border bg-surface/70 text-foreground/80 hover:bg-muted",
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-7 flex items-center gap-2.5">
        <p className="mr-auto text-sm text-muted-foreground">
          {picked.length} selected{picked.length < MIN ? ` · ${MIN - picked.length} more` : ""}
        </p>
        <Button variant="brand" size="lg" onClick={finish} disabled={picked.length < MIN || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {busy ? "Building your feed…" : "Enter Gihanga"}
        </Button>
      </div>
    </AuthLayout>
  );
}
