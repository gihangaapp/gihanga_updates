import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Camera,
  ChevronDown,
  Film,
  Globe,
  Minus,
  Plus,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/Heropage_image.png";
import enableImage from "@/assets/enable section.png";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Gihanga Updates — The Creative Platform for Rwanda" },
      {
        name: "description",
        content:
          "Join thousands of creators on Gihanga Updates. Share stories, reels, go live, and build your audience across Rwanda and East Africa.",
      },
      { property: "og:title", content: "Gihanga Updates — The Creative Platform for Rwanda" },
      {
        property: "og:description",
        content: "Share stories, reels, and updates with creators shaping culture across Rwanda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

/* ─── Navbar Links ─────────────────────────────────────────── */
const navLinks = [
  { label: "Creators", icon: Sparkles, href: "#creators" },
  { label: "Community", icon: Users, href: "#community" },
  { label: "Reels", icon: Film, href: "#reels" },
  { label: "Live", icon: Camera, href: "#live" },
  { label: "Wallet", icon: Wallet, href: "#wallet" },
  { label: "Get the App", icon: Globe, href: "#download" },
];

/* ─── Explore Content Categories ───────────────────────────── */
const exploreCategories = [
  "Music",
  "Comedy",
  "Dance",
  "Fashion",
  "Technology",
  "Photography",
  "Art & Design",
  "Food & Cooking",
  "Education",
  "Sports",
  "Travel",
  "Storytelling",
  "Business",
];

const discoverCategories = [
  "Top Creators",
  "Trending Reels",
  "Live Now",
  "New Voices",
  "Kigali Scene",
  "Culture & Heritage",
  "Fitness & Health",
  "Podcasts",
  "Beauty",
  "Motivation",
  "Gaming",
  "Music Production",
];

/* ─── Enable Section Steps ─────────────────────────────────── */
const enableSteps = [
  {
    number: "01",
    title: "Create your account.",
    body: "Sign up in seconds with your email or social accounts. No fees, ever.",
  },
  {
    number: "02",
    title: "Build your profile.",
    body: "Add your bio, avatar, and links. Tell your story before you post one.",
  },
  {
    number: "03",
    title: "Post your first update.",
    body: "Share a photo, reel, or story with your followers instantly.",
  },
  {
    number: "04",
    title: "Go live anytime.",
    body: "Broadcast to your community in real-time with one tap.",
  },
  {
    number: "05",
    title: "Grow your audience.",
    body: "Use hashtags, trends, and the explore page to reach new viewers.",
  },
  {
    number: "06",
    title: "Earn with your content.",
    body: "Get paid in RWF through tips, ads revenue, and brand partnerships directly in your wallet.",
  },
  {
    number: "07",
    title: "Connect & collaborate.",
    body: "Message creators, join communities, and build lasting relationships.",
  },
];

/* ─── FAQ Data ─────────────────────────────────────────────── */
const faqGeneral = [
  {
    q: "What is Gihanga Updates?",
    a: "Gihanga Updates is a social content platform built for creators and audiences in Rwanda and across East Africa. Share stories, reels, go live, and get paid for your creativity.",
  },
  {
    q: "Is Gihanga Updates free to use?",
    a: "Yes! Creating an account, posting, watching, and engaging is completely free. Creators can also earn money through tips, ad revenue, and brand deals.",
  },
  {
    q: "Who can become a creator?",
    a: "Anyone! Apply for creator status in your settings. Once approved, you unlock advanced analytics, scheduling, monetization tools, and more.",
  },
  {
    q: "What content can I post?",
    a: "Photos, videos, stories, reels, text updates, and live streams. Express yourself however feels right.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We use industry-standard encryption and give you granular privacy controls over who sees your content and profile.",
  },
];

const faqCreators = [
  {
    q: "How do I earn money on Gihanga Updates?",
    a: "Creators earn through viewer tips (in RWF), ad revenue sharing, brand partnership deals, and premium content subscriptions.",
  },
  {
    q: "How do payouts work?",
    a: "Earnings are tracked in your Wallet. Withdraw directly to your mobile money account or bank at any time.",
  },
  {
    q: "Can I schedule posts?",
    a: "Yes! Creator accounts get access to the Studio with post scheduling, analytics dashboards, and draft management.",
  },
  {
    q: "What are the community guidelines?",
    a: "We promote authentic, respectful content. Hate speech, harassment, and harmful content are not tolerated. Full guidelines are in our Terms of Service.",
  },
  {
    q: "How do live streams work?",
    a: "Tap the Live button, set a title, and start broadcasting. Viewers can join, react, comment, and send tips in real-time.",
  },
  {
    q: "Can I collaborate with other creators?",
    a: "Yes! You can tag, mention, and co-create content with other users. Collaboration features are built into the creator toolkit.",
  },
];

/* ─── Footer Links ─────────────────────────────────────────── */
const footerColumns = [
  {
    title: "General",
    links: ["Sign Up", "Help Center", "About", "Press", "Blog", "Careers", "Developers"],
  },
  {
    title: "Explore",
    links: ["Creators", "Reels", "Stories", "Live", "Trending", "Explore", "Hashtags"],
  },
  {
    title: "For Creators",
    links: ["Studio", "Analytics", "Wallet", "Ads", "Brand Deals"],
  },
  {
    title: "Resources",
    links: [
      "Community Guidelines",
      "Safety Center",
      "Terms of Service",
      "Privacy Policy",
      "Cookie Policy",
      "Accessibility",
    ],
  },
];

/* ─── Animated Peeking Get Started Button ──────────────────── */
export function GetStartedButton({
  to = "/register",
  className,
  size = "lg",
  children = "GET STARTED",
  variant = "brand",
}: {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  // "md" maps to Button's default size (kept for API compat).
  children?: React.ReactNode;
  variant?: "brand" | "solid-blue";
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Gihanga Peeking Icon directly underneath the button */}
      <motion.div
        initial={false}
        animate={
          isHovered ? { y: "90%", opacity: 1, scale: 1 } : { y: "15%", opacity: 0, scale: 0.75 }
        }
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 26,
        }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 z-0 flex flex-col items-center"
      >
        {/* Large Gihanga Logo Icon */}
        <div className="size-10 sm:size-15 rounded-2xl   p-2  flex items-center justify-center -mt-2">
          <img src={logoImg} alt="Gihanga Icon" className="size-full object-contain" />
        </div>
      </motion.div>

      {/* Main Interactive Button */}
      <Button
        variant={variant === "solid-blue" ? "default" : "brand"}
        size={size === "md" ? "default" : size}
        className={cn(
          "relative z-10 font-display font-extrabold tracking-widest uppercase transition-all duration-300 shadow-soft",
          isHovered && "-translate-y-0.5 shadow-md",
          variant === "solid-blue" && "bg-blue-600 hover:bg-blue-500 text-white",
        )}
        asChild
      >
        <Link to={to}>{children}</Link>
      </Button>
    </div>
  );
}

/* ─── Category Pill Component ──────────────────────────────── */
function CategoryPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="press rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-primary-soft hover:text-primary"
    >
      {label}
    </button>
  );
}

/* ─── FAQ Item Component ───────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="press flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-semibold text-foreground">{question}</span>
        <span className="shrink-0 text-primary">
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───────────── NAVBAR ───────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="press flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <link.icon className="size-4" />
                <span className="text-[11px] font-semibold">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="brand" size="sm" asChild>
              <Link to="/welcome">Join now</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ───────────── HERO SECTION (Screenshot 1) ───────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle brand gradient orbs */}
        <div className="gradient-brand pointer-events-none absolute -top-40 -left-32 size-[500px] rounded-full opacity-20 blur-3xl" />
        <div className="halo pointer-events-none absolute -right-48 top-20 size-[600px] rounded-full opacity-30 blur-3xl" />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-5 py-16 sm:px-8 lg:flex-row lg:gap-16 lg:py-24">
          {/* Left — Text & CTA */}
          <div className="relative max-w-xl flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[40px] leading-[1.08] font-extrabold tracking-tight sm:text-[52px] lg:text-[56px]"
            >
              Welcome to your <span className="text-gradient-brand">creative community</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground lg:mx-0"
            >
              Stories, reels and updates from the creators shaping culture across Rwanda — with the
              tools to build an audience and get paid for it in RWF.
            </motion.p>

            {/* Auth buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mx-auto mt-8 flex max-w-sm flex-col gap-3.5 lg:mx-0"
            >
              <GetStartedButton size="lg" className="w-full">
                GET STARTED — IT'S FREE
              </GetStartedButton>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/login">Sign in with email</Link>
              </Button>

              <p className="mt-2 text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <a href="#" className="font-semibold text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </motion.div>
          </div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1"
          >
            <img
              src={heroImage}
              alt="Gihanga Updates — creative community illustration"
              className="mx-auto max-h-[480px] w-full object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ───────────── EXPLORE CONTENT (Screenshot 2 — Top) ───────────── */}
      <section id="creators" className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
            {/* Left heading */}
            <div className="max-w-xs shrink-0">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[36px]"
              >
                Explore top Gihanga content
              </motion.h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Discover trending posts and creator spotlights — curated by topic and in one place.
              </p>
            </div>

            {/* Right — category pills */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-1 flex-wrap gap-2.5"
            >
              {exploreCategories.map((cat) => (
                <CategoryPill key={cat} label={cat} />
              ))}
              <button
                type="button"
                className="press flex items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Show all
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── DISCOVER CATEGORIES (Screenshot 2 — Bottom) ───────────── */}
      <section id="community" className="border-t border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
            {/* Left heading */}
            <div className="max-w-xs shrink-0">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[36px]"
              >
                Find the right creator for you
              </motion.h2>
            </div>

            {/* Right — discover pills */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-1 flex-wrap gap-2.5"
            >
              {discoverCategories.map((cat) => (
                <CategoryPill key={cat} label={cat} />
              ))}
              <button
                type="button"
                className="press flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:text-primary"
              >
                Show more
                <ChevronDown className="size-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── ENABLE SECTION (Screenshot 3 — Seamless Frameless Phone) ───────────── */}
      <section
        id="reels"
        className="border-t border-border/60 py-16 sm:py-24 relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <h2 className="font-display text-[36px] leading-tight font-extrabold tracking-tight sm:text-[48px]">
              Start <span className="text-gradient-brand">creating</span> on Gihanga today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground">
              From your first post to your first payout — everything you need to build and grow your
              presence.
            </p>
          </motion.div>

          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20">
            {/* Left — Phone mockup without background box, clean and transparent */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative shrink-0 flex items-center justify-center"
            >
              <div className="relative mx-auto max-w-[320px] bg-transparent">
                <img
                  src={enableImage}
                  alt="Gihanga Updates app screen"
                  className="relative max-h-[540px] w-auto object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Right — Steps accordion */}
            <div className="flex-1">
              {enableSteps.map((step, i) => (
                <EnableStep key={step.number} step={step} index={i} />
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-10 pb-6"
              >
                <GetStartedButton size="lg" to="/register">
                  GET STARTED
                </GetStartedButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STATS BAR ───────────── */}
      <section className="border-y border-border/60 gradient-brand py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-5 sm:gap-16 sm:px-8">
          {[
            { value: "50K+", label: "Active Creators" },
            { value: "1M+", label: "Monthly Views" },
            { value: "200K+", label: "Community Members" },
            { value: "RWF", label: "Payouts in Local Currency" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold tracking-wider text-white/80 uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── FAQ SECTION (Screenshot 4) ───────────── */}
      <section id="wallet" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            {/* Left — sticky heading */}
            <div className="shrink-0 lg:sticky lg:top-24 lg:self-start lg:w-64">
              <p className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                FAQ
              </p>
              <h2 className="mt-2 font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[38px]">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Everything you need to know about Gihanga Updates.
              </p>
              <div className="mt-6 pb-6">
                <GetStartedButton size="sm" to="/register">
                  GET STARTED
                </GetStartedButton>
              </div>
            </div>

            {/* Right — FAQ items */}
            <div className="flex-1">
              {/* General */}
              <p className="mb-3 text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
                General
              </p>
              {faqGeneral.map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}

              {/* Creators */}
              <p className="mb-3 mt-10 text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
                For Creators
              </p>
              {faqCreators.map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA BANNER ───────────── */}
      <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[32px] font-extrabold tracking-tight sm:text-[42px]"
          >
            Ready to share your <span className="text-gradient-brand">story</span>?
          </motion.h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
            Join thousands of creators already building their audience on Gihanga Updates. It's
            free, always.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center pb-6">
            <GetStartedButton size="lg" to="/register">
              CREATE YOUR FREE ACCOUNT
            </GetStartedButton>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER (Screenshot 5) ───────────── */}
      <footer id="download" className="border-t border-border/60 bg-card py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Top — Logo + Columns */}
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            {/* Logo Column */}
            <div className="shrink-0">
              <Logo />
              <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                The creative platform for Rwanda and East Africa.
              </p>
            </div>

            {/* Link Columns */}
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="mb-3 text-sm font-bold text-foreground">{col.title}</p>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-1.5">
              <Logo compact className="opacity-50" />
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "About",
                "Accessibility",
                "Terms",
                "Privacy Policy",
                "Cookie Policy",
                "Community Guidelines",
              ].map((item) => (
                <a key={item} href="#" className="hover:text-foreground hover:underline">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Enable Step Accordion Item ───────────────────────────── */
function EnableStep({ step, index }: { step: (typeof enableSteps)[0]; index: number }) {
  const [open, setOpen] = useState(index === 5); // 06 open by default like screenshot

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="border-b border-border/60"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="press flex w-full items-center gap-4 py-4 text-left"
      >
        <span className="font-display text-sm font-bold text-primary">{step.number}</span>
        <span
          className={cn(
            "flex-1 text-[15px] font-semibold",
            open ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {step.title}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-32 pb-4 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <p className="pl-10 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
      </div>
    </motion.div>
  );
}
