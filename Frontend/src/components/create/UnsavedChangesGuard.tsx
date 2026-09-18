import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesGuardProps {
  open: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onContinue: () => void;
}

export function UnsavedChangesGuard({
  open,
  onSaveDraft,
  onDiscard,
  onContinue,
}: UnsavedChangesGuardProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onContinue()}>
      <AlertDialogContent className="max-w-[340px] rounded-3xl border-border bg-card p-6">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="font-display text-lg font-extrabold tracking-tight">
            Leave without saving?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            You have unsaved changes. Would you like to save them as a draft?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="brand" className="w-full" onClick={onSaveDraft}>
            Save Draft
          </Button>
          <Button
            variant="outline"
            className="w-full text-danger hover:bg-danger/10 hover:text-danger"
            onClick={onDiscard}
          >
            Discard
          </Button>
          <AlertDialogCancel asChild>
            <Button variant="ghost" className="w-full" onClick={onContinue}>
              Continue Editing
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
