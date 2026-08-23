import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, MousePointerClick, Pause, Play, Plus, Target, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCount } from "@/lib/format";
import {
  useMyCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  type CampaignObjective,
  type Campaign,
} from "@/hooks/use-ads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "Ad Center — Gihanga Updates" },
      {
        name: "description",
        content:
          "Launch campaigns, pick an objective and audience, and track impressions, clicks and spend across Rwanda.",
      },
      { property: "og:title", content: "Ad Center — Gihanga Updates" },
      { property: "og:description", content: "Create and manage promotional campaigns on Gihanga Updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

const STATUS_STYLE: Record<Campaign["status"], string> = {
  review: "bg-amber-500/15 text-amber-600",
  active: "bg-success/15 text-success",
  paused: "bg-muted text-muted-foreground",
  completed: "bg-primary-soft text-primary",
  rejected: "bg-danger/15 text-danger",
};

const OBJECTIVES: { id: CampaignObjective; label: string }[] = [
  { id: "reach", label: "Reach" },
  { id: "views", label: "Views" },
  { id: "clicks", label: "Clicks" },
  { id: "leads", label: "Leads" },
  { id: "conversions", label: "Conversions" },
];

function NewCampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createCampaign = useCreateCampaign();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<CampaignObjective>("reach");
  const [dailyBudget, setDailyBudget] = useState("5000");
  const [totalBudget, setTotalBudget] = useState("50000");

  function submit() {
    if (!name.trim()) {
      toast.error("Give your campaign a name");
      return;
    }
    createCampaign.mutate(
      { name: name.trim(), objective, dailyBudget: Number(dailyBudget), totalBudget: Number(totalBudget) },
      {
        onSuccess: () => {
          toast.success("Campaign submitted for review");
          onOpenChange(false);
          setName("");
        },
        onError: (err: any) => toast.error(err.message || "Couldn't create campaign"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" />
          <div className="grid grid-cols-3 gap-1.5">
            {OBJECTIVES.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setObjective(o.id)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-semibold",
                  objective === o.id ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Daily budget</label>
              <Input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Total budget</label>
              <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} />
            </div>
          </div>
          <Button variant="brand" onClick={submit} disabled={createCampaign.isPending}>
            {createCampaign.isPending ? "Submitting…" : "Submit for review"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Spend is deducted from your wallet's available balance as the campaign runs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const progress = campaign.totalBudget > 0 ? Math.min(100, (campaign.spent / campaign.totalBudget) * 100) : 0;

  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold">{campaign.name}</p>
          <p className="text-xs text-muted-foreground">{campaign.objective}</p>
        </div>
        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_STYLE[campaign.status])}>
          {campaign.status}
        </span>
      </div>

      {campaign.status === "rejected" && campaign.rejectionReason && (
        <p className="mt-2 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs text-danger">{campaign.rejectionReason}</p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="flex items-center justify-center gap-1 font-bold">
            <Eye className="size-3" /> {formatCount(campaign.impressions)}
          </p>
          <p className="text-muted-foreground">Impressions</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-bold">
            <MousePointerClick className="size-3" /> {formatCount(campaign.clicks)}
          </p>
          <p className="text-muted-foreground">Clicks</p>
        </div>
        <div>
          <p className="font-bold">{campaign.ctr}%</p>
          <p className="text-muted-foreground">CTR</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{rwf(campaign.spent)} spent</span>
          <span>{rwf(campaign.totalBudget)} budget</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="gradient-brand h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {(campaign.status === "active" || campaign.status === "paused") && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() =>
              updateCampaign.mutate({ id: campaign._id, status: campaign.status === "active" ? "paused" : "active" })
            }
          >
            {campaign.status === "active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {campaign.status === "active" ? "Pause" : "Resume"}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-danger"
          onClick={() => {
            deleteCampaign.mutate(campaign._id);
            toast.success("Campaign removed");
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function AdsPage() {
  const { data, isLoading } = useMyCampaigns();
  const [newOpen, setNewOpen] = useState(false);
  const campaigns = data?.campaigns ?? [];

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px] space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Ad Center</h1>
            <p className="text-sm text-muted-foreground">Promote your content to reach more people.</p>
          </div>
          <Button variant="brand" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" /> New campaign
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="surface-card p-4 text-center">
            <Wallet className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-lg font-extrabold">{rwf(totalSpend)}</p>
            <p className="text-xs text-muted-foreground">Total spend</p>
          </div>
          <div className="surface-card p-4 text-center">
            <Eye className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-lg font-extrabold">{formatCount(totalImpressions)}</p>
            <p className="text-xs text-muted-foreground">Impressions</p>
          </div>
          <div className="surface-card p-4 text-center">
            <Target className="mx-auto mb-1 size-5 text-primary" />
            <p className="font-display text-lg font-extrabold">{campaigns.filter((c) => c.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading campaigns…</p>
        ) : campaigns.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-2 py-14 text-center">
            <Target className="size-8 text-muted-foreground" />
            <p className="font-bold text-muted-foreground">No campaigns yet</p>
            <Button variant="brand" size="sm" onClick={() => setNewOpen(true)}>
              Create your first campaign
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {campaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </div>
      <NewCampaignDialog open={newOpen} onOpenChange={setNewOpen} />
    </AppShell>
  );
}
