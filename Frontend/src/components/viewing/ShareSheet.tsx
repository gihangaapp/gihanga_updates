import { useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  text?: string;
  url?: string;
}

export function ShareSheet({
  open,
  onOpenChange,
  title = "Check this out on Gihanga Updates",
  text,
  url,
}: ShareSheetProps) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);

  const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: targetUrl,
        });
        onOpenChange(false);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Share failed");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-emerald-600 text-white",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${targetUrl}`)}`,
    },
    {
      name: "Twitter / X",
      icon: ExternalLink,
      color: "bg-black text-white dark:bg-white dark:text-black",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(targetUrl)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-sky-500 text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(title)}`,
    },
  ];

  const content = (
    <div className="flex flex-col gap-5 p-5">
      {/* Copy Link Input Bar */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2">
        <input
          type="text"
          readOnly
          value={targetUrl}
          className="flex-1 min-w-0 bg-transparent px-2 text-xs font-medium text-foreground truncate focus:outline-none"
        />
        <Button variant="brand" size="sm" onClick={handleCopyLink} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {/* Social Share Grid */}
      <div className="flex items-center justify-around gap-2 pt-2">
        {shareLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenChange(false)}
              className="press flex flex-col items-center gap-2"
            >
              <div
                className={`grid size-12 place-items-center rounded-2xl ${item.color} shadow-sm`}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{item.name}</span>
            </a>
          );
        })}
      </div>

      {/* Native Share button if supported */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <Button
          variant="outline"
          className="w-full justify-center gap-2 mt-2"
          onClick={handleNativeShare}
        >
          <Share2 className="size-4 text-primary" />
          More Share Options
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-0">
          <DrawerHeader className="border-b border-border px-5 py-3">
            <DrawerTitle className="font-display text-base font-bold text-center">
              Share
            </DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 rounded-3xl gap-0 border-border">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-base font-bold">Share Content</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
