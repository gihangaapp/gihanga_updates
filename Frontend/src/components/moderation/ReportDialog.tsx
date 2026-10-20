import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export const REPORT_REASONS = [
  "Nudity",
  "Violence",
  "Harassment",
  "Spam",
  "Misinformation",
  "Copyright",
  "Other",
] as const;

type TargetType = "post" | "story" | "comment" | "user";

/**
 * REAL content report dialog — POST /api/v1/moderation/reports.
 * Rate-limited server-side, deduplicated per reporter+target, and NEVER
 * auto-removes content (reports only raise staff priority). The reporter's
 * identity is not revealed to the reported user.
 */
export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: TargetType;
  targetId: string;
}) {
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("Nudity");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api.post(
        "/moderation/reports",
        { targetType, targetId, reason, details: details.trim() || undefined },
      ),
  });

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submit.mutateAsync();
      setDone(true);
      toast.success("Report submitted — our moderation team will review it.");
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
        setDetails("");
        setReason("Nudity");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.message || "Could not submit the report — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Flag className="size-4 text-danger" />
            Report this {targetType === "user" ? "account" : targetType}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Your report goes to our moderation team. Your identity is never shown to the person
            being reported. Reports never automatically remove content — a human reviews every case.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-2 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-foreground/80">Why are you reporting?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    reason === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold text-foreground/80">
              Add details <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Anything that helps our moderators understand the issue…"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">{details.length}/300</p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border p-3">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={submitting || done}
            onClick={handleSubmit}
          >
            {done ? "Reported" : submitting ? "Sending…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
