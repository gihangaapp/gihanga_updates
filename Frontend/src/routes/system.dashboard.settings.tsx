import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, Plus, Settings, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useStaffSettings,
  useSetMomoVisibility,
  useSetFeatureFlag,
  useStaffCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-staff-management";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/settings")({
  component: PlatformSettingsPage,
});

function MomoVisibilityCard() {
  const { data } = useStaffSettings();
  const setMomo = useSetMomoVisibility();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-foreground">
        <Wallet className="size-4" /> MTN MoMo visibility
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Controls whether the deposit/withdraw buttons show up in users' wallets. Turn this off to hide MoMo
        entirely while credentials aren't configured yet, without touching any code.
      </p>
      <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
        <span className="text-sm font-semibold text-foreground">Show MoMo deposit/withdraw to users</span>
        <button
          type="button"
          onClick={() => setMomo.mutate(!(data?.momoVisible ?? true), { onSuccess: () => toast.success("Updated") })}
          className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", data?.momoVisible ? "bg-indigo-500" : "bg-white/10")}
        >
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", data?.momoVisible ? "translate-x-[22px]" : "translate-x-0.5")} />
        </button>
      </div>
    </div>
  );
}

function FeatureFlagsCard() {
  const { data } = useStaffSettings();
  const flags = data?.flags ?? [];
  const known = [
    { key: "live_streaming_enabled", label: "Live streaming" },
    { key: "ads_enabled", label: "Ads" },
    { key: "gifting_enabled", label: "Gifting" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-foreground">
        <Settings className="size-4" /> Feature flags
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">Kill-switches for major platform features.</p>
      <div className="space-y-2">
        {known.map((f) => {
          const current = flags.find((x) => x.key === f.key);
          const enabled = current?.value ?? true;
          return <FlagRow key={f.key} label={f.label} flagKey={f.key} enabled={enabled} />;
        })}
      </div>
    </div>
  );
}

function FlagRow({ label, flagKey, enabled }: { label: string; flagKey: string; enabled: boolean }) {
  const setFlag = useSetFeatureFlag();
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => setFlag.mutate({ key: flagKey, value: !enabled }, { onSuccess: () => toast.success("Updated") })}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", enabled ? "bg-indigo-500" : "bg-white/10")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", enabled ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function CategoriesCard() {
  const { data } = useStaffCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-foreground">
        <Layers className="size-4" /> Content categories
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">Used to organize Explore/Trending topics.</p>

      <div className="mb-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className="h-10 flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button
          variant="brand"
          disabled={!name.trim() || createCategory.isPending}
          onClick={() =>
            createCategory.mutate({ name: name.trim() }, { onSuccess: () => { toast.success("Category added"); setName(""); } })
          }
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(data?.categories ?? []).map((c) => (
          <span
            key={c._id}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
              c.active ? "bg-muted text-foreground/90" : "bg-muted/40 text-muted-foreground line-through",
            )}
          >
            <button type="button" onClick={() => updateCategory.mutate({ id: c._id, active: !c.active })}>
              {c.name}
            </button>
            <button type="button" aria-label={`Delete ${c.name}`} onClick={() => deleteCategory.mutate(c._id)} className="text-muted-foreground hover:text-danger">
              <Trash2 className="size-3" />
            </button>
          </span>
        ))}
        {!data?.categories.length && <p className="text-sm text-muted-foreground">No categories yet.</p>}
      </div>
    </div>
  );
}

function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <Settings className="size-6 text-warning" /> Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">Super Admin only — global configuration for the whole platform.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MomoVisibilityCard />
        <FeatureFlagsCard />
        <CategoriesCard />
      </div>
    </div>
  );
}
