import { useState } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
  Clock,
  Coins,
  Wallet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdPreview } from "./AdPreview";
import {
  useAdConfig,
  useCalculateAdPrice,
  useCreateAd,
  AdType,
  AdPlacement,
  Advertisement,
} from "@/hooks/use-ads";
import { useWallet } from "@/hooks/use-wallet";
import { formatCount } from "@/lib/format";
import { uploadFile, mediaUrl as resolveMediaUrl } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface AdWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (campaign: Advertisement) => void;
}

export function AdWizard({ open, onOpenChange, onCreated }: AdWizardProps) {
  const { data: config } = useAdConfig();
  const { data: walletData } = useWallet();
  const createAd = useCreateAd();

  const [step, setStep] = useState(1);

  // Form State
  const [adType, setAdType] = useState<AdType>("image");
  const [placement, setPlacement] = useState<AdPlacement>("feed");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaUrl, setCtaUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const [campaignDurationDays, setCampaignDurationDays] = useState(7);
  const [advertisingMinutes, setAdvertisingMinutes] = useState(10);

  // Live Price Calculation
  const { data: priceData, isLoading: priceLoading } = useCalculateAdPrice(
    advertisingMinutes,
    campaignDurationDays,
  );

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const kind = isVideo ? "videos" : "photos";

    if (isVideo) {
      setAdType(placement === "story" ? "story_video" : "video");
    } else {
      setAdType(placement === "story" ? "story_image" : "image");
    }

    setIsUploading(true);

    uploadFile(kind, file)
      .then((res) => {
        const absoluteUrl = resolveMediaUrl(res.url) || res.url;
        setMediaUrl(absoluteUrl);
        toast.success("Media uploaded successfully!");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to upload media");
      })
      .finally(() => setIsUploading(false));
  }

  function handleCreateDraft() {
    if (!title.trim()) {
      toast.error("Please enter a title for your campaign");
      return;
    }

    createAd.mutate(
      {
        adType,
        placement,
        title: title.trim(),
        caption: caption.trim() || undefined,
        ctaText: ctaText.trim() || "Learn More",
        ctaUrl: ctaUrl.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: adType.includes("video") ? "video" : "image",
        videoDurationSeconds,
        thumbnailUrl: thumbnailUrl || undefined,
        campaignDurationDays,
        advertisingMinutes,
      },
      {
        onSuccess: (data) => {
          toast.success("Ad campaign created!");
          onCreated?.(data.campaign);
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create campaign");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-display text-xl font-extrabold">
              <Sparkles className="size-5 text-amber-500" />
              Advertise on Gihanga Updates
            </DialogTitle>
            <div className="flex gap-1 text-xs font-bold text-muted-foreground">
              Step {step} of 4
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* STEP 1: AD TYPE & CONTENT */}
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">1. Choose Content & Media</h3>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Ad Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Summer Collection Launch"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Caption / Description
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    placeholder="Write a brief description that engages your target audience..."
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Button Text
                    </label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Destination Link URL
                    </label>
                    <Input
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Upload Image or Video
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 hover:bg-muted/60 transition-colors">
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Loader2 className="size-4 animate-spin text-primary" /> Uploading media to
                        server...
                      </div>
                    ) : mediaUrl ? (
                      <div className="text-center text-xs text-success font-semibold flex items-center gap-1.5">
                        <CheckCircle className="size-4" /> Media attached! Click to change.
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
                        <Upload className="size-5 text-primary" />
                        <span className="font-semibold text-foreground">Click to upload media</span>
                        <span>
                          Supports JPG, PNG, MP4, MOV (Max video length:{" "}
                          {config?.maxVideoDurationSeconds ?? 120}s)
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview Box */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-foreground">Live Ad Preview</h3>
                <AdPreview
                  adType={adType}
                  placement={placement}
                  title={title || "Your Campaign Title"}
                  caption={caption}
                  ctaText={ctaText}
                  ctaUrl={ctaUrl}
                  mediaUrl={mediaUrl}
                  thumbnailUrl={thumbnailUrl}
                />
              </div>
            </div>
          )}

          {/* STEP 2: PLACEMENT */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground">
                2. Select Where Your Ad Will Appear
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Feed Placement */}
                <button
                  type="button"
                  onClick={() => {
                    setPlacement("feed");
                    setAdType(
                      mediaUrl?.includes(".mp4") || mediaUrl?.includes(".mov") ? "video" : "image",
                    );
                  }}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all",
                    placement === "feed"
                      ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Layers className="size-5" />
                    </span>
                    {placement === "feed" && <CheckCircle className="size-5 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">In-Feed Advertisement</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Appears organically in users' home feeds alongside creator posts marked
                      clearly as "Sponsored". High visibility and engagement.
                    </p>
                  </div>
                </button>

                {/* Story Placement */}
                <button
                  type="button"
                  onClick={() => {
                    setPlacement("story");
                    setAdType(
                      mediaUrl?.includes(".mp4") || mediaUrl?.includes(".mov")
                        ? "story_video"
                        : "story_image",
                    );
                  }}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all",
                    placement === "story"
                      ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                      <ImageIcon className="size-5" />
                    </span>
                    {placement === "story" && <CheckCircle className="size-5 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Story Advertisement</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Delivered full-screen between user stories with an interactive swipe-up call
                      to action. Ideal for mobile immersion.
                    </p>
                  </div>
                </button>
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
                <h4 className="mb-3 text-xs font-bold text-muted-foreground">
                  Placement Preview ({placement.toUpperCase()})
                </h4>
                <AdPreview
                  adType={adType}
                  placement={placement}
                  title={title || "Your Campaign Title"}
                  caption={caption}
                  ctaText={ctaText}
                  ctaUrl={ctaUrl}
                  mediaUrl={mediaUrl}
                  thumbnailUrl={thumbnailUrl}
                />
              </div>
            </div>
          )}

          {/* STEP 3: DURATION & ADVERTISING MINUTES */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground">
                3. Duration & Advertising Minutes
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Advertising Minutes (Quota Purchased)
                    </label>
                    <Input
                      type="number"
                      min={config?.minMinutes ?? 1}
                      max={config?.maxMinutes ?? 180}
                      value={advertisingMinutes}
                      onChange={(e) => setAdvertisingMinutes(Number(e.target.value))}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      1 advertising minute = 60 seconds of total active user view time delivered to
                      your target audience.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Campaign Duration (Calendar Days)
                    </label>
                    <Input
                      type="number"
                      min={config?.minCampaignDays ?? 1}
                      max={config?.maxCampaignDays ?? 30}
                      value={campaignDurationDays}
                      onChange={(e) => setCampaignDurationDays(Number(e.target.value))}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      The campaign will run over this period until your advertising minutes quota is
                      fulfilled.
                    </p>
                  </div>

                  {/* Preset Packages */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-foreground">
                      Quick Packages
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setAdvertisingMinutes(mins)}
                          className={cn(
                            "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                            advertisingMinutes === mins
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-border text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Summary Box */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Clock className="size-4 text-primary" /> Cost Summary & Rates
                  </h4>

                  {priceLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  ) : priceData ? (
                    <div className="space-y-3 text-xs">
                      {priceData.breakdown.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between border-b border-border/40 pb-1.5"
                        >
                          <span className="text-muted-foreground">{item.line}:</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}

                      {/* Payment Options Summary */}
                      <div className="mt-4 grid grid-cols-2 gap-2 pt-2">
                        <div className="rounded-xl bg-primary-soft/40 p-3 text-center">
                          <span className="text-[10px] text-muted-foreground block font-bold">
                            Real Money Cost
                          </span>
                          <span className="font-display font-extrabold text-sm text-primary">
                            {priceData.rwfTotal.toLocaleString()} RWF
                          </span>
                        </div>
                        <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                          <span className="text-[10px] text-muted-foreground block font-bold">
                            Gihanga Points Cost
                          </span>
                          <span className="font-display font-extrabold text-sm text-amber-500">
                            {formatCount(priceData.gpTotal)} GP
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground">4. Review Campaign & Create</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-foreground">Campaign Summary</h4>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-bold text-foreground">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placement:</span>
                    <span className="capitalize font-bold text-foreground">{placement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Advertising Minutes:</span>
                    <span className="font-bold text-foreground">{advertisingMinutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calendar Duration:</span>
                    <span className="font-bold text-foreground">{campaignDurationDays} days</span>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/80 bg-elevated p-3 space-y-1">
                    <span className="font-bold text-xs text-foreground block">
                      Payment Options Available:
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      • Real Money: {priceData?.rwfTotal.toLocaleString()} RWF (Wallet Balance /
                      MoMo)
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      • Gihanga Points: {formatCount(priceData?.gpTotal ?? 0)} GP (Your Balance:{" "}
                      {formatCount(walletData?.wallet?.kingdomPoints ?? 0)} GP)
                    </p>
                  </div>
                </div>

                {/* Final Preview */}
                <div>
                  <h4 className="mb-2 text-xs font-bold text-muted-foreground">Final Ad Preview</h4>
                  <AdPreview
                    adType={adType}
                    placement={placement}
                    title={title}
                    caption={caption}
                    ctaText={ctaText}
                    ctaUrl={ctaUrl}
                    mediaUrl={mediaUrl}
                    thumbnailUrl={thumbnailUrl}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            {step > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-1.5 size-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                variant="brand"
                size="sm"
                onClick={() => {
                  if (step === 1 && !title.trim()) {
                    toast.error("Please enter a campaign title");
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next Step <ArrowRight className="ml-1.5 size-4" />
              </Button>
            ) : (
              <Button
                variant="brand"
                size="lg"
                disabled={createAd.isPending}
                onClick={handleCreateDraft}
              >
                {createAd.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Creating Campaign…
                  </>
                ) : (
                  <>
                    Create & Proceed to Checkout
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
