import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  FIELD_LABELS,
  fieldInput,
  parseField,
  type Lot,
  type LotStatus,
  type LotValues,
} from "@/lib/app/lot-fields";
import { useUpdateLot } from "@/lib/app/lots";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { StatusSelect } from "./LotStatus";

const TEXT_FIELDS = [
  "numero",
  "type",
  "surface_habitable",
  "surface_terrain",
  "chambres",
  "salles_de_bain",
  "prix",
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

const UNITS: Partial<Record<TextField, string>> = {
  surface_habitable: "m²",
  surface_terrain: "m²",
};

const MAX_FEATURES = 30;

const featuresOf = (lot: Lot): string[] =>
  Array.isArray(lot.features) ? lot.features.filter((f): f is string => typeof f === "string") : [];

/** Every field of a lot, with its description and features (shown later on the lot page). */
export function LotDetailsSheet({
  projectId,
  currency,
  lot,
  lots,
  open,
  onOpenChange,
}: {
  projectId: string;
  currency: string;
  lot: Lot | null;
  lots: Lot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {lot ? (
          <LotDetailsForm
            key={lot.id}
            projectId={projectId}
            currency={currency}
            lot={lot}
            lots={lots}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function LotDetailsForm({
  projectId,
  currency,
  lot,
  lots,
  onDone,
}: {
  projectId: string;
  currency: string;
  lot: Lot;
  lots: Lot[];
  onDone: () => void;
}) {
  const update = useUpdateLot(projectId);
  const [text, setText] = useState<Record<TextField, string>>(
    () =>
      Object.fromEntries(TEXT_FIELDS.map((f) => [f, fieldInput(f, lot[f])])) as Record<
        TextField,
        string
      >,
  );
  const [statut, setStatut] = useState<LotStatus>(lot.statut);
  const [description, setDescription] = useState(lot.description ?? "");
  const [features, setFeatures] = useState(() => featuresOf(lot));
  const [feature, setFeature] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<TextField | "description" | "features", string>>
  >({});

  const addFeature = () => {
    const items = feature
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    const tooLong = items.find((f) => f.length > 60);
    if (tooLong)
      return setErrors((e) => ({
        ...e,
        features: "60 caractères au maximum par caractéristique.",
      }));
    const next = [...features];
    for (const item of items)
      if (!next.some((f) => f.toLowerCase() === item.toLowerCase())) next.push(item);
    if (next.length > MAX_FEATURES) {
      return setErrors((e) => ({ ...e, features: `${MAX_FEATURES} caractéristiques au maximum.` }));
    }
    setFeatures(next);
    setFeature("");
    setErrors(({ features: _, ...rest }) => rest);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: Partial<LotValues> = {};
    const found: typeof errors = {};
    for (const field of TEXT_FIELDS) {
      const result = parseField(field, text[field]);
      if (result.ok) Object.assign(values, { [field]: result.value });
      else found[field] = result.error;
    }
    const desc = parseField("description", description);
    if (desc.ok) values.description = desc.value;
    else found.description = desc.error;
    const numero = String(values.numero ?? "");
    if (
      !found.numero &&
      lots.some((l) => l.id !== lot.id && l.numero.trim().toLowerCase() === numero.toLowerCase())
    ) {
      found.numero = `Le lot n° ${numero} existe déjà.`;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const changes: TablesUpdate<"lots"> = {};
    for (const [field, value] of Object.entries(values) as [
      keyof LotValues,
      LotValues[keyof LotValues],
    ][]) {
      if (value !== lot[field]) Object.assign(changes, { [field]: value });
    }
    if (statut !== lot.statut) changes.statut = statut;
    if (JSON.stringify(features) !== JSON.stringify(featuresOf(lot))) changes.features = features;
    if (Object.keys(changes).length === 0) return onDone();

    try {
      await update.mutateAsync({ id: lot.id, values: changes });
      toast.success(`Lot n° ${numero} enregistré`);
      onDone();
    } catch {
      /* the error is shown by useUpdateLot */
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <SheetHeader className="text-left">
        <SheetTitle>Lot n° {lot.numero}</SheetTitle>
        <SheetDescription>
          La description et les caractéristiques apparaîtront sur la fiche publique du lot.
        </SheetDescription>
      </SheetHeader>

      <fieldset disabled={update.isPending} className="mt-6 flex-1 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {TEXT_FIELDS.map((field) => {
            const id = `lot-${field}`;
            return (
              <div key={field} className="space-y-2">
                <Label htmlFor={id}>
                  {FIELD_LABELS[field]}
                  {UNITS[field] ? (
                    <span className="font-normal text-muted-foreground"> ({UNITS[field]})</span>
                  ) : null}
                  {field === "prix" ? (
                    <span className="font-normal text-muted-foreground"> ({currency})</span>
                  ) : null}
                </Label>
                <Input
                  id={id}
                  value={text[field]}
                  onChange={(e) => setText((t) => ({ ...t, [field]: e.target.value }))}
                  inputMode={field === "numero" || field === "type" ? undefined : "decimal"}
                  list={field === "type" ? "lot-types" : undefined}
                  autoComplete="off"
                  aria-invalid={errors[field] ? true : undefined}
                  aria-describedby={errors[field] ? `${id}-error` : undefined}
                  className="h-11"
                />
                {errors[field] ? (
                  <p id={`${id}-error`} className="text-xs text-red-300">
                    {errors[field]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Statut</span>
          <StatusSelect
            value={statut}
            onChange={setStatut}
            label="Statut du lot"
            className="h-11 w-full border-input bg-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lot-description">Description</Label>
          <Textarea
            id="lot-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex. : villa d'angle orientée sud, piscine à débordement, vue sur l'Atlas."
          />
          {errors.description ? <p className="text-xs text-red-300">{errors.description}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lot-feature">Caractéristiques</Label>
          {features.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Caractéristiques du lot">
              {features.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1 text-sm"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => setFeatures((list) => list.filter((x) => x !== f))}
                    className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Retirer ${f}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2">
            <Input
              id="lot-feature"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Ex. : Piscine privée, Ascenseur"
              autoComplete="off"
              className="h-11"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={addFeature}
              disabled={!feature.trim()}
            >
              Ajouter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Entrée pour ajouter ; séparez par des virgules pour en ajouter plusieurs.
          </p>
          {errors.features ? <p className="text-xs text-red-300">{errors.features}</p> : null}
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end gap-3 border-t border-border bg-background px-6 py-4">
        <Button type="button" variant="outline" className="h-11" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" className="h-11" disabled={update.isPending}>
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
