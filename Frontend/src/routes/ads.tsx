import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Eye, MousePointerClick, Wallet, Coins, Sparkles, Target, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/AdCard";
import { AdWizard } from "@/components/ads/AdWizard";
import { useMyAds, useAdConfig, Advertisement } from "@/hooks/use-ads";
import { useWallet } from "@/hooks/use-wallet";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "Ad Center — Gihanga Updates" },
      {
        name: "description",
        content:
          "Launch campaigns, pay with Real Money or Gihanga Points, choose feed or story placement, and track impressions, clicks and reach across Rwanda.",
      },
      { property: "og:title", content: "Ad Center — Gihanga Updates" },
      { property: "og:description", content: "Create and manage promotional advertising campaigns on Gihanga Updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function AdsPage() {
  const { data: campaigns = [], isLoading } = useMyAds();
  const { data: config } = useAdConfig();
  const { data: walletData } = useWallet();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [tab, setTab] = useState<string>("all");

  const totalSpentRwf = campaigns
    .filter((c) => c.paymentMethod === "real_money" && c.paymentStatus === "paid")
    .reduce((sum, c) => sum + (c.totalRwfCost || 0), 0);

  const totalPointsSpent = campaigns
    .filter((c) => c.paymentMethod === "gihanga_points" && c.paymentStatus === "paid")
    .reduce((sum, c) => sum + (c.totalGpCost || 0), 0);

  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.analytics?.impressions || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const filteredCampaigns = campaigns.filter((c) => {
    if (tab === "all") return true;
    if (tab === "active") return c.status === "active";
    if (tab === "pending") return c.status === "pending_review" || c.status === "pending_payment";
    if (tab === "unpaid") return c.paymentStatus !== "paid";
    return true;
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[920px] space-y-6">
        {/* Header Title & Create Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-6 text-amber-500" /> Advertising Center
            </h1>
            <p className="text-sm text-muted-foreground">
              Promote your content, products, or brand across Rwanda using Real Money or Gihanga Points.
            </p>
          </div>

          <Button variant="brand" size="lg" onClick={() => setWizardOpen(true)}>
            <Plus className="mr-1.5 size-5" /> Create Campaign
          </Button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="surface-card p-4 text-center">
            <Target className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Active Campaigns</p>
          </div>

          <div className="surface-card p-4 text-center">
            <Eye className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{formatCount(totalImpressions)}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Impressions</p>
          </div>

          <div className="surface-card p-4 text-center">
            <Coins className="mx-auto mb-1 size-5 text-amber-500" />
            <p className="font-display text-xl font-extrabold text-foreground">{formatCount(totalPointsSpent)} GP</p>
            <p className="text-xs text-muted-foreground font-medium">Points Spent</p>
          </div>

          <div className="surface-card p-4 text-center">
            <Wallet className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{rwf(totalSpentRwf)}</p>
            <p className="text-xs text-muted-foreground font-medium">Cash Spent</p>
          </div>
        </div>

        {/* Live Rates & Conversion Info Banner */}
        <div className="rounded-2xl border border-border bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-500 font-bold">
              GP
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Gihanga Points Advertising Enabled</p>
              <p className="text-xs text-muted-foreground">
                Current Superadmin Rate: <strong className="text-foreground">1 Advertising Minute = {formatCount(config?.gpPerMinute ?? 2000)} GP</strong> or <strong className="text-foreground">{rwf(config?.rwfPerMinute ?? 2000)}</strong>
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-muted-foreground block">Your Points Balance</span>
            <span className="font-display text-base font-extrabold text-amber-500">
              {formatCount(walletData?.wallet?.kingdomPoints ?? 0)} GP
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
          {[
            { id: "all", label: "All Campaigns" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending Review" },
            { id: "unpaid", label: "Unpaid Drafts" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading your campaigns…</p>
        ) : filteredCampaigns.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 py-16 text-center border-dashed">
            <Layers className="size-10 text-muted-foreground/60" />
            <p className="font-bold text-base text-foreground">No campaigns found</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Launch your first advertisement to reach thousands of users across Rwanda in feed and story placements.
            </p>
            <Button variant="brand" size="sm" onClick={() => setWizardOpen(true)}>
              <Plus className="mr-1 size-4" /> Launch Campaign Now
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredCampaigns.map((campaign) => (
              <AdCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* Guided Creation Wizard Modal */}
      <AdWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </AppShell>
  );
}
