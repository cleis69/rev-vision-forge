import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection } from "@/components/app/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dbErrorMessage } from "@/lib/app/errors";
import { useUpdateProject, type Project } from "@/lib/app/projects";
import {
  AMENITY_ICONS,
  MAX_AMENITIES,
  MAX_AMENITY_LABEL,
  amenityIcon,
  parseAmenities,
  type Amenity,
} from "@/lib/amenities";

type Row = Amenity & { key: number };
let nextKey = 1;
const toRow = (a: Amenity): Row => ({ ...a, key: nextKey++ });

/** Amenities of the residence, shown as pictograms in the Prestations section of the public page. */
export function AmenitiesSettings({ project }: { project: Project }) {
  const update = useUpdateProject(project.id);
  const initial = useMemo(() => parseAmenities(project.amenities), [project.amenities]);
  const [rows, setRows] = useState<Row[]>(() => initial.map(toRow));
  const clean = rows.flatMap((r) =>
    r.label.trim() ? [{ icon: r.icon, label: r.label.trim() }] : [],
  );
  const dirty = JSON.stringify(clean) !== JSON.stringify(initial);
  const missing = AMENITY_ICONS.filter(
    (a) => a.key !== "autre" && !rows.some((r) => r.icon === a.key),
  );

  const add = (icon: string, label: string) =>
    setRows((list) => (list.length >= MAX_AMENITIES ? list : [...list, toRow({ icon, label })]));
  const change = (key: number, values: Partial<Amenity>) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...values } : r)));
  const move = (index: number, step: -1 | 1) =>
    setRows((list) => {
      const next = [...list];
      const [row] = next.splice(index, 1);
      if (row) next.splice(index + step, 0, row);
      return next;
    });

  const save = () =>
    update.mutate(
      { amenities: clean },
      {
        onSuccess: (saved) => {
          setRows(parseAmenities(saved.amenities).map(toRow));
          toast.success("Prestations enregistrées");
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  return (
    <SettingsSection
      title="Prestations"
      description="Les atouts de la résidence, en pictogrammes dans la rubrique Prestations de la page publique (16 au maximum)."
    >
      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row, index) => {
            const Icon = amenityIcon(row.icon);
            return (
              <li key={row.key} className="flex items-center gap-2">
                <Select value={row.icon} onValueChange={(icon) => change(row.key, { icon })}>
                  <SelectTrigger className="h-11 w-16 shrink-0 px-3" aria-label="Pictogramme">
                    <SelectValue>
                      <Icon className="size-4 text-primary" aria-hidden />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {AMENITY_ICONS.map((a) => (
                      <SelectItem key={a.key} value={a.key}>
                        <span className="inline-flex items-center gap-2">
                          <a.Icon className="size-4 text-primary" aria-hidden />
                          {a.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={row.label}
                  onChange={(e) =>
                    change(row.key, { label: e.target.value.slice(0, MAX_AMENITY_LABEL) })
                  }
                  aria-label="Intitulé"
                  className="h-11 min-w-0 flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Monter, ${row.label}`}
                >
                  <ArrowUp aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0"
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Descendre, ${row.label}`}
                >
                  <ArrowDown aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0"
                  onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
                  aria-label={`Retirer, ${row.label}`}
                >
                  <X aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune prestation pour l'instant.</p>
      )}

      {rows.length < MAX_AMENITIES ? (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ajouter
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => add(a.key, a.label)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <a.Icon className="size-3.5 text-primary" aria-hidden />
                {a.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => add("autre", "")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-3.5" aria-hidden />
              Autre
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="h-11" onClick={save} disabled={!dirty || update.isPending}>
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {dirty && !update.isPending ? (
          <Button variant="ghost" className="h-11" onClick={() => setRows(initial.map(toRow))}>
            Annuler les modifications
          </Button>
        ) : null}
      </div>
    </SettingsSection>
  );
}
