import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Eye, Clock, CheckCircle2, Sparkles, Target, Layers, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/AdCard";
import { AdWizard } from "@/components/ads/AdWizard";
import { useMyAds, Advertisement } from "@/hooks/use-ads";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "Ad Center — Gihanga Updates" },
      { name: "description", content: "Create and manage sponsored campaigns, arrange manual payment with our team, and track advertising performance across Feed, Reels and Stories." },
      { property: "og:title", content: "Ad Center — Gihanga Updates" },
      { property: "og:description", content: "Create and manage promotional advertising campaigns on Gihanga Updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdsPage,
});

function AdsPage() {
  const { data: campaigns = [], isLoading } = useMyAds();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tab, setTab] = useState<string>("all");

  const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.impressions || 0), 0);
  const activeCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const reviewCount = campaigns.filter((campaign) => campaign.status === "pending_review").length;
  const awaitingPaymentCount = campaigns.filter((campaign) => campaign.status === "approved" && campaign.manualPaymentStatus !== "verified").length;

  const filteredCampaigns = campaigns.filter((campaign: Advertisement) => {
    if (tab === "active") return campaign.status === "active";
    if (tab === "pending") return campaign.status === "pending_review";
    if (tab === "unpaid") return campaign.status === "approved" && campaign.manualPaymentStatus !== "verified";
    return true;
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[920px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-foreground">
              <Sparkles className="size-6 text-amber-500" /> Advertising Center
            </h1>
            <p className="text-sm text-muted-foreground">Promote your content, products, or brand across Gihanga Updates Feed, Reels and Stories.</p>
          </div>
          <Button variant="brand" size="lg" onClick={() => setWizardOpen(true)}>
            <Plus className="mr-1.5 size-5" /> Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="surface-card p-4 text-center">
            <Target className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{activeCount}</p>
            <p className="text-xs font-medium text-muted-foreground">Active Campaigns</p>
          </div>
          <div className="surface-card p-4 text-center">
            <Eye className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{formatCount(totalImpressions)}</p>
            <p className="text-xs font-medium text-muted-foreground">Total Impressions</p>
          </div>
          <div className="surface-card p-4 text-center">
            <Clock className="mx-auto mb-1 size-5 text-amber-500" />
            <p className="font-display text-xl font-extrabold text-foreground">{reviewCount}</p>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Review</p>
          </div>
          <div className="surface-card p-4 text-center">
            <Wallet className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-xl font-extrabold text-foreground">{awaitingPaymentCount}</p>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Payment</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><CheckCircle2 className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">Manual payment — no online checkout</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Submit your campaign with a valid phone number and email. After the creative is approved, our team will contact you to arrange payment outside the app. Ads are published only after an authorized administrator confirms receipt.</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
          {[
            { id: "all", label: "All Campaigns" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending Review" },
            { id: "unpaid", label: "Awaiting Payment" },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all", tab === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted")}>
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading your campaigns…</p>
        ) : filteredCampaigns.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 border-dashed py-16 text-center">
            <Layers className="size-10 text-muted-foreground/60" />
            <p className="text-base font-bold text-foreground">No campaigns found</p>
            <p className="max-w-md text-xs text-muted-foreground">Launch an advertisement to reach users in Feed, Reels and Stories. Campaigns are reviewed before payment is arranged.</p>
            <Button variant="brand" size="sm" onClick={() => setWizardOpen(true)}><Plus className="mr-1 size-4" /> Launch Campaign</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">{filteredCampaigns.map((campaign) => <AdCard key={campaign._id} campaign={campaign} />)}</div>
        )}
      </div>
      <AdWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </AppShell>
  );
}
