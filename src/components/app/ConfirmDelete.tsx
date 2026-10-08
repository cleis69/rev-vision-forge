import { useId, useState, type ReactNode } from "react";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dbErrorMessage } from "@/lib/app/errors";

/** Irreversible deletion: the user types the name of what is deleted to confirm. */
export function ConfirmDelete({
  title,
  description,
  confirmText,
  actionLabel,
  onConfirm,
  children,
}: {
  title: string;
  description: ReactNode;
  confirmText: string;
  actionLabel: string;
  onConfirm: () => Promise<void>;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = typed.trim() === confirmText.trim();

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      setError(dbErrorMessage(e));
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) {
          setTyped("");
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches && !pending) void confirm();
          }}
        >
          <Label htmlFor={id} className="leading-relaxed">
            Pour confirmer, tapez{" "}
            <span className="font-semibold text-foreground">{confirmText}</span>
          </Label>
          <Input
            id={id}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="h-11"
          />
        </form>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!matches || pending}
            onClick={() => void confirm()}
          >
            {pending ? "Suppression…" : actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
