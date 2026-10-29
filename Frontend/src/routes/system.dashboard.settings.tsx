import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, Plus, Settings, Trash2, Wallet, ShieldCheck, ToggleLeft } from "lucide-react";
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
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminToggle,
  AdminBadge,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/settings")({
  component: PlatformSettingsPage,
});

function MomoVisibilityCard() {
  const { data } = useStaffSettings();
  const setMomo = useSetMomoVisibility();

  return (
    <AdminCard className="p-5">
      <AdminCardHeader
        title={
          <span className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" /> MTN MoMo visibility
          </span>
        }
        subtitle="Controls whether the deposit/withdraw buttons show up in users' wallets. Turn this off to hide MoMo entirely while credentials aren't configured yet, without touching any code."
      />
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
        <div>
          <span className="text-sm font-bold text-foreground">
            Show MoMo deposit/withdraw to users
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data?.momoVisible === false ? "Currently hidden from wallets" : "Currently visible in wallets"}
          </p>
        </div>
        <AdminToggle
          checked={data?.momoVisible ?? true}
          onChange={() =>
            setMomo.mutate(!(data?.momoVisible ?? true), {
              onSuccess: () => toast.success("Updated"),
              onError: (err: any) => toast.error(err.message || "Failed to update"),
            })
          }
        />
      </div>
    </AdminCard>
  );
}

function FlagRow({
  label,
  flagKey,
  enabled,
}: {
  label: string;
  flagKey: string;
  enabled: boolean;
}) {
  const setFlag = useSetFeatureFlag();
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="min-w-0">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{flagKey}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <AdminBadge tone={enabled ? "success" : "muted"} dot>
          {enabled ? "On" : "Off"}
        </AdminBadge>
        <AdminToggle
          checked={enabled}
          onChange={() =>
            setFlag.mutate(
              { key: flagKey, value: !enabled },
              {
                onSuccess: () => toast.success(`${label} ${!enabled ? "enabled" : "disabled"}`),
                onError: (err: any) => toast.error(err.message || "Failed to update"),
              },
            )
          }
        />
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
    <AdminCard className="p-5">
      <AdminCardHeader
        title={
          <span className="flex items-center gap-2">
            <ToggleLeft className="size-4 text-accent" /> Feature flags
          </span>
        }
        subtitle="Kill-switches for major platform features."
      />
      <div className="mt-4 space-y-2.5">
        {known.map((f) => {
          const current = flags.find((x) => x.key === f.key);
          const enabled = current?.value ?? true;
          return <FlagRow key={f.key} label={f.label} flagKey={f.key} enabled={enabled} />;
        })}
      </div>
    </AdminCard>
  );
}

function CategoriesCard() {
  const { data } = useStaffCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");

  return (
    <AdminCard className="p-5 lg:col-span-2">
      <AdminCardHeader
        title={
          <span className="flex items-center gap-2">
            <Layers className="size-4 text-info" /> Content categories
          </span>
        }
        subtitle="Used to organize Explore/Trending topics."
      />

      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            name.trim() &&
            createCategory.mutate(
              { name: name.trim() },
              {
                onSuccess: () => {
                  toast.success("Category added");
                  setName("");
                },
                onError: (err: any) => toast.error(err.message || "Failed to add"),
              },
            )
          }
          placeholder="New category name…"
          className="h-10 flex-1 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
        />
        <Button
          variant="brand"
          className="h-10"
          disabled={!name.trim() || createCategory.isPending}
          onClick={() =>
            createCategory.mutate(
              { name: name.trim() },
              {
                onSuccess: () => {
                  toast.success("Category added");
                  setName("");
                },
                onError: (err: any) => toast.error(err.message || "Failed to add"),
              },
            )
          }
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(data?.categories ?? []).map((c) => (
          <span
            key={c._id}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-semibold",
              c.active
                ? "bg-primary-soft/50 text-foreground"
                : "bg-muted/40 text-muted-foreground line-through",
            )}
          >
            <button
              type="button"
              title={c.active ? "Click to deactivate" : "Click to activate"}
              onClick={() =>
                updateCategory.mutate(
                  { id: c._id, active: !c.active },
                  { onSuccess: () => toast.success("Updated") },
                )
              }
            >
              {c.name}
            </button>
            <button
              type="button"
              aria-label={`Delete ${c.name}`}
              onClick={() =>
                deleteCategory.mutate(c._id, {
                  onSuccess: () => toast.success(`Deleted ${c.name}`),
                  onError: (err: any) => toast.error(err.message || "Failed to delete"),
                })
              }
              className="text-muted-foreground transition-colors hover:text-danger"
            >
              <Trash2 className="size-3" />
            </button>
          </span>
        ))}
        {!data?.categories.length && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>
    </AdminCard>
  );
}

function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Settings}
        title="Platform Settings"
        description="Super Admin only — global configuration for the whole platform."
        accent="warning"
        action={
          <span className="flex items-center gap-1.5 rounded-xl bg-warning/10 px-3.5 py-2 text-xs font-bold text-warning">
            <ShieldCheck className="size-4" /> Restricted access
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <MomoVisibilityCard />
        <FeatureFlagsCard />
        <CategoriesCard />
      </div>
    </div>
  );
}
