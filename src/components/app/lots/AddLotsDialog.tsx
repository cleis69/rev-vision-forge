import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nextNumero, splitNumero, type Lot, type LotStatus } from "@/lib/app/lot-fields";
import { lotErrorMessage, useCreateLots } from "@/lib/app/lots";
import { StatusSelect } from "./LotStatus";

const MAX_LOTS = 200;

/** Several lots at once, numbered in a row: V1, V2… V10. */
export function AddLotsDialog({
  projectId,
  lots,
  open,
  onOpenChange,
}: {
  projectId: string;
  lots: Lot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter des lots</DialogTitle>
          <DialogDescription>
            Les lots sont créés numérotés à la suite. Vous compléterez ensuite surfaces et prix dans
            le tableau, ou par un import CSV.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <AddLotsForm projectId={projectId} lots={lots} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AddLotsForm({
  projectId,
  lots,
  onDone,
}: {
  projectId: string;
  lots: Lot[];
  onDone: () => void;
}) {
  const create = useCreateLots(projectId);
  const [count, setCount] = useState("10");
  // Continues the current numbering: after V1…V5, it proposes V6.
  const [initial] = useState(() => splitNumero(nextNumero(lots.map((l) => l.numero))));
  const [first, setFirst] = useState(String(initial?.number ?? 1));
  const [prefix, setPrefix] = useState(initial?.prefix ?? "");
  const [type, setType] = useState("Villa");
  const [statut, setStatut] = useState<LotStatus>("disponible");
  const [notice, setNotice] = useState<string | null>(null);

  const plan = useMemo(() => {
    const n = Number(count);
    const start = Number(first);
    if (!Number.isInteger(n) || n < 1 || n > MAX_LOTS)
      return { error: `Entre 1 et ${MAX_LOTS} lots.` };
    if (!Number.isInteger(start) || start < 0)
      return { error: "Le premier numéro doit être un nombre entier." };
    if (prefix.trim().length > 20) return { error: "Préfixe : 20 caractères au maximum." };
    const width = initial?.width ?? 1;
    const numeros = Array.from(
      { length: n },
      (_, i) => `${prefix.trim()}${String(start + i).padStart(width, "0")}`,
    );
    const taken = new Set(lots.map((l) => l.numero.trim().toLowerCase()));
    const clashes = numeros.filter((x) => taken.has(x.toLowerCase()));
    if (clashes.length > 0) {
      const shown = clashes.slice(0, 5).join(", ") + (clashes.length > 5 ? "…" : "");
      return {
        error: `${clashes.length === 1 ? "Ce numéro existe" : "Ces numéros existent"} déjà : ${shown}.`,
      };
    }
    return { numeros };
  }, [count, first, prefix, lots, initial]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!plan.numeros) return;
    setNotice(null);
    const start = lots.reduce((max, l) => Math.max(max, l.sort_order), 0);
    try {
      const created = await create.mutateAsync(
        plan.numeros.map((numero, i) => ({
          numero,
          type: type.trim() || null,
          statut,
          sort_order: start + i + 1,
        })),
      );
      toast.success(`${created.length} ${created.length === 1 ? "lot ajouté" : "lots ajoutés"}`);
      onDone();
    } catch (error) {
      setNotice(lotErrorMessage(error));
    }
  };

  const range = plan.numeros
    ? plan.numeros.length === 1
      ? `Lot ${plan.numeros[0]}`
      : `Lots ${plan.numeros[0]} à ${plan.numeros[plan.numeros.length - 1]}`
    : null;

  return (
    <form onSubmit={submit} noValidate>
      <fieldset disabled={create.isPending} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="add-count">Nombre</Label>
            <Input
              id="add-count"
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-prefix">
              Préfixe <span className="font-normal text-muted-foreground">(option)</span>
            </Label>
            <Input
              id="add-prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="V"
              autoComplete="off"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-first">Premier n°</Label>
            <Input
              id="add-first"
              inputMode="numeric"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              className="h-11"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="add-type">Type</Label>
            <Input
              id="add-type"
              list="lot-types"
              value={type}
              onChange={(e) => setType(e.target.value)}
              autoComplete="off"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Statut</span>
            <StatusSelect
              value={statut}
              onChange={setStatut}
              label="Statut des nouveaux lots"
              className="h-11 w-full border-input"
            />
          </div>
        </div>

        <p
          className={plan.error ? "text-sm text-red-300" : "text-sm text-muted-foreground"}
          role="status"
        >
          {plan.error ?? range}
        </p>
        {notice ? <Notice tone="error">{notice}</Notice> : null}

        <DialogFooter className="gap-3 pt-1 sm:gap-3">
          <Button type="button" variant="outline" className="h-11" onClick={onDone}>
            Annuler
          </Button>
          <Button type="submit" className="h-11" disabled={!plan.numeros || create.isPending}>
            {create.isPending
              ? "Ajout…"
              : `Ajouter ${plan.numeros?.length ?? ""} ${plan.numeros?.length === 1 ? "lot" : "lots"}`}
          </Button>
        </DialogFooter>
      </fieldset>
    </form>
  );
}
