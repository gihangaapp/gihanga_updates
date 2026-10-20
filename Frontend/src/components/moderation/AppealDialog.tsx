import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquareHeart } from "lucide-react";
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

/**
 * Appeal a rejected moderation decision — POST /api/v1/moderation/appeals.
 * One open appeal per record; author-only; critical-protocol records are
 * non-appealable (the backend refuses with a generic message).
 */
export function AppealDialog({
  open,
  onOpenChange,
  recordId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
}) {
  const [statement, setStatement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api.post("/moderation/appeals", { recordId, statement: statement.trim() }),
  });

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submit.mutateAsync();
      toast.success("Appeal submitted — we'll review it and notify you.");
      onOpenChange(false);
      setStatement("");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit the appeal — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquareHeart className="size-4 text-primary" />
            Appeal this decision
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tell us why you believe this content follows our guidelines. A human moderator —
            not an automated system — will review your appeal.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-2">
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value.slice(0, 2000))}
            rows={5}
            placeholder="For example: the image shows a medical procedure, a breastfeeding moment, or artwork shared for educational purposes…"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {statement.length}/2000 · at least 20 characters
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border p-3">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={submitting || statement.trim().length < 20}
            onClick={handleSubmit}
          >
            {submitting ? "Sending…" : "Submit appeal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
