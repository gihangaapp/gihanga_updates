import { useState } from "react";
import { Loader2, MessageCircle, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdComments, useCreateAdComment } from "@/hooks/use-ads";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/format";

export function AdCommentsDialog({
  adId,
  adTitle,
  open,
  onOpenChange,
}: {
  adId: string;
  adTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, staffUser } = useAuth();
  const canComment = Boolean(user || staffUser);
  const { data, isLoading, isError } = useAdComments(adId, open);
  const createComment = useCreateAdComment(adId);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body || createComment.isPending) return;
    if (!canComment) {
      toast.info("Sign in to comment on advertisements.");
      return;
    }
    createComment.mutate(body, {
      onSuccess: (result) => {
        setDraft("");
        if (result.pendingNotice) toast.info(result.pendingNotice);
        else toast.success("Comment posted.");
      },
      onError: (error: any) => toast.error(error.message || "Could not post your comment"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-3 overflow-hidden sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircle className="size-5 text-primary" /> Comments</DialogTitle>
          <p className="text-xs text-muted-foreground">Conversation on “{adTitle}”</p>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading comments…</div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Comments could not be loaded. Close and reopen to try again.</p>
          ) : !data?.comments.length ? (
            <div className="py-10 text-center">
              <MessageCircle className="mx-auto mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No comments yet</p>
              <p className="text-xs text-muted-foreground">Be the first to start the conversation.</p>
            </div>
          ) : data.comments.map((comment) => (
            <article key={comment._id} className="flex gap-2.5 rounded-xl bg-muted/40 p-3">
              {comment.author.avatarUrl ? (
                <img src={comment.author.avatarUrl} alt="" className="size-8 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-bold">{comment.author.name || `@${comment.author.username}`}</span>
                  <span className="text-[10px] text-muted-foreground">@{comment.author.username}</span>
                  <span className="text-[10px] text-muted-foreground">· {timeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="shrink-0 border-t border-border pt-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={canComment ? "Write a comment…" : "Sign in to comment…"}
            maxLength={1000}
            rows={2}
            disabled={!canComment || createComment.isPending}
            className="resize-none text-sm"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">Comments may be reviewed before appearing publicly.</span>
            <Button size="sm" onClick={submit} disabled={!draft.trim() || createComment.isPending || !canComment}>
              {createComment.isPending ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Send className="mr-1 size-3.5" />}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
