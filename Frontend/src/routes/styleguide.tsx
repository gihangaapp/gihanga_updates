import { createFileRoute } from "@tanstack/react-router";
import { Heart, Radio, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { Logo } from "@/components/common/Logo";
import { currentUser, users } from "@/mock/data";

export const Route = createFileRoute("/styleguide")({
  head: () => ({
    meta: [
      { title: "Design System — Gihanga Updates" },
      {
        name: "description",
        content:
          "The Gihanga Updates design system: Ocean Deep color tokens, Sora and Manrope typography, buttons, avatars, badges and loading states.",
      },
      { property: "og:title", content: "Design System — Gihanga Updates" },
      {
        property: "og:description",
        content:
          "Ocean Deep color tokens, typography scale, and the reusable component library behind Gihanga Updates.",
      },
    ],
  }),
  component: Styleguide,
});

const swatches = [
  ["Primary", "bg-primary", "text-primary-foreground"],
  ["Accent", "bg-accent", "text-accent-foreground"],
  ["Aqua", "bg-aqua", "text-aqua-foreground"],
  ["Success", "bg-success", "text-success-foreground"],
  ["Warning", "bg-warning", "text-warning-foreground"],
  ["Danger", "bg-danger", "text-danger-foreground"],
  ["Info", "bg-info", "text-info-foreground"],
  ["Surface", "bg-surface border border-border", "text-foreground"],
  ["Elevated", "bg-elevated", "text-foreground"],
  ["Muted", "bg-muted", "text-muted-foreground"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card mb-4 p-5">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Styleguide() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[760px]">
        <header className="halo surface-card mb-4 p-6">
          <Logo />
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            The <span className="text-gradient-brand">Ocean Deep</span> design system
          </h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Every color, radius, shadow and motion curve used across Gihanga Updates lives here as a
            semantic token. Phase 1 foundations.
          </p>
        </header>

        <Section title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {swatches.map(([name, bg, fg]) => (
              <div key={name} className={`grid h-20 place-items-center rounded-2xl ${bg}`}>
                <span className={`text-xs font-bold ${fg}`}>{name}</span>
              </div>
            ))}
          </div>
          <div className="gradient-brand mt-3 grid h-16 place-items-center rounded-2xl">
            <span className="text-sm font-bold text-primary-foreground">Brand gradient</span>
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-2">
            <p className="font-display text-4xl font-extrabold tracking-tight">Display / Sora 800</p>
            <p className="font-display text-2xl font-bold">Heading / Sora 700</p>
            <p className="text-lg font-semibold">Subtitle / Manrope 600</p>
            <p className="leading-relaxed text-foreground/85">
              Body / Manrope 400 — readable at every size, tuned for long captions and comment
              threads without feeling like a document.
            </p>
            <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              Overline / Manrope 500
            </p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="brand">
              <Sparkles /> Brand
            </Button>
            <Button>Default</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="destructive">Danger</Button>
            <Button variant="link">Link</Button>
            <Button size="icon" aria-label="Like">
              <Heart />
            </Button>
            <Button size="pill" variant="soft">
              <Radio /> Go live
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Avatars & identity">
          <div className="flex flex-wrap items-end gap-5">
            <GAvatar user={currentUser} size="xl" ring="story" />
            <GAvatar user={users[0]!} size="lg" ring="live" />
            <GAvatar user={users[1]!} size="md" ring="seen" />
            <GAvatar user={users[2]!} size="sm" />
            <GAvatar user={users[3]!} size="xs" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <UserName user={users[0]!} showHandle />
            <UserName user={users[5]!} showHandle />
          </div>
        </Section>

        <Section title="Badges, inputs & controls">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Creator</Badge>
            <Badge variant="secondary">Following</Badge>
            <Badge variant="outline">Draft</Badge>
            <Badge variant="destructive">Live</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input placeholder="Search creators…" />
            <Input placeholder="Disabled" disabled />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Switch id="sg-switch" defaultChecked />
            <label htmlFor="sg-switch" className="text-sm font-medium">
              Autoplay videos
            </label>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Upload progress · 68% · 2 of 3 files
            </p>
            <Progress value={68} />
          </div>
        </Section>

        <Section title="Elevation & motion">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="lift grid h-24 place-items-center rounded-2xl bg-surface shadow-soft">
              <span className="text-xs font-bold">shadow-soft · lift</span>
            </div>
            <div className="grid h-24 place-items-center rounded-2xl bg-surface shadow-float">
              <span className="text-xs font-bold">shadow-float</span>
            </div>
            <div className="gradient-brand animate-float grid h-24 place-items-center rounded-2xl shadow-glow">
              <span className="text-xs font-bold text-primary-foreground">shadow-glow · float</span>
            </div>
          </div>
        </Section>

        <Section title="Loading states">
          <PostSkeleton />
        </Section>

        <Section title="Empty state">
          <div className="grid place-items-center rounded-2xl border border-dashed border-border-strong py-12 text-center">
            <span className="gradient-brand grid size-14 place-items-center rounded-2xl shadow-glow">
              <Send className="size-6 text-primary-foreground" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">No updates yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              When creators you follow post, their updates will land right here.
            </p>
            <Button variant="brand" className="mt-4">
              Discover creators
            </Button>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
