import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Check, Loader2, RefreshCw, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadStage =
  "preparing" | "uploading" | "processing" | "publishing" | "completed" | "failed";

interface UploadProgressProps {
  stage: UploadStage;
  progress: number; // 0–100 for uploading stage
  error?: string | undefined;
  onRetry?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
}

const stageConfig: Record<UploadStage, { label: string; sublabel?: string; color: string }> = {
  preparing: { label: "Preparing media…", color: "text-info" },
  uploading: { label: "Uploading…", color: "text-primary" },
  processing: {
    label: "Processing…",
    sublabel: "This may take a moment for large files",
    color: "text-accent",
  },
  publishing: { label: "Publishing…", color: "text-primary" },
  completed: { label: "Published!", color: "text-success" },
  failed: { label: "Something went wrong", color: "text-danger" },
};

export function UploadProgress({
  stage,
  progress,
  error,
  onRetry,
  onCancel,
  onDone,
}: UploadProgressProps) {
  const config = stageConfig[stage];
  const isActive = stage !== "completed" && stage !== "failed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="mx-4 flex w-full max-w-[360px] flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 shadow-float"
      >
        {/* Icon */}
        <div
          className={cn(
            "grid size-16 place-items-center rounded-2xl",
            stage === "completed" && "bg-success/15",
            stage === "failed" && "bg-danger/15",
            isActive && "bg-primary-soft",
          )}
        >
          {stage === "completed" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <Check className="size-8 text-success" strokeWidth={3} />
            </motion.div>
          ) : stage === "failed" ? (
            <AlertCircle className="size-8 text-danger" />
          ) : (
            <Loader2 className="size-8 animate-spin text-primary" />
          )}
        </div>

        {/* Label */}
        <div className="text-center">
          <p className={cn("text-base font-bold", config.color)}>{config.label}</p>
          {config.sublabel && (
            <p className="mt-1 text-xs text-muted-foreground">{config.sublabel}</p>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>

        {/* Progress bar — only during uploading */}
        {stage === "uploading" && (
          <div className="w-full">
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
            <p className="mt-1.5 text-center text-xs font-semibold text-muted-foreground">
              {progress}%
            </p>
          </div>
        )}

        {/* Stage dots */}
        {isActive && (
          <div className="flex items-center gap-2">
            {(["preparing", "uploading", "processing", "publishing"] as const).map((s, i) => {
              const stages = ["preparing", "uploading", "processing", "publishing"];
              const currentIdx = stages.indexOf(stage);
              const thisIdx = i;
              return (
                <div
                  key={s}
                  className={cn(
                    "size-2 rounded-full transition-all duration-300",
                    thisIdx < currentIdx && "bg-primary",
                    thisIdx === currentIdx && "bg-primary scale-125",
                    thisIdx > currentIdx && "bg-muted",
                  )}
                />
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex w-full gap-2">
          {stage === "failed" && (
            <>
              {onCancel && (
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {onRetry && (
                <Button variant="brand" className="flex-1" onClick={onRetry}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              )}
            </>
          )}
          {stage === "completed" && onDone && (
            <Button variant="brand" className="w-full" onClick={onDone}>
              Done
            </Button>
          )}
          {isActive && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto text-muted-foreground"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
