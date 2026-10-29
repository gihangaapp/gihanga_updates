"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Mobile bottom-sheet drag handle (hidden from `sm` up, so desktop modals are
 * unchanged). Dragging it down past a threshold closes the dialog.
 */
function SheetHandle({
  targetRef,
  closeRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const startY = React.useRef<number | null>(null);
  const delta = React.useRef(0);

  const onStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null;
    delta.current = 0;
    if (targetRef.current) targetRef.current.style.transition = "none";
  };
  const onMove = (e: React.TouchEvent) => {
    if (startY.current == null || !targetRef.current) return;
    delta.current = Math.max(0, (e.touches[0]?.clientY ?? 0) - startY.current);
    targetRef.current.style.transform = `translateY(${delta.current}px)`;
  };
  const onEnd = () => {
    const el = targetRef.current;
    startY.current = null;
    if (!el) return;
    if (delta.current > 90) {
      closeRef.current?.click();
    } else {
      el.style.transition = "transform 180ms ease-out";
      el.style.transform = "";
    }
    delta.current = 0;
  };

  return (
    <div
      aria-hidden
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
      className="absolute inset-x-0 top-0 z-10 flex h-6 touch-none items-start justify-center pt-1.5 sm:hidden"
    >
      <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };
  // Dialogs that set p-0 manage their own spacing; only the safe-area inset is added.
  const noPad = /(^|\s)p-0(\s|$)/.test(className ?? "");
  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={setRefs}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:rounded-lg max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:pt-8 max-sm:shadow-2xl max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom",
        noPad
          ? "max-sm:pb-[env(safe-area-inset-bottom)]"
          : "max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      <SheetHandle targetRef={localRef} closeRef={closeRef} />
      {children}
      <DialogPrimitive.Close ref={closeRef} className="absolute right-4 top-4 max-sm:right-3 max-sm:top-5 max-sm:z-20 max-sm:p-2 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center max-sm:pr-8 max-sm:text-left sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse max-sm:gap-2 max-sm:[&>*]:w-full sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
