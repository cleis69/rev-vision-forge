import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  PanelRightOpen,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  FIELD_LABELS,
  LOT_STATUSES,
  LOT_TYPES,
  compareNumeros,
  fieldInput,
  parseField,
  type Lot,
} from "@/lib/app/lot-fields";
import { formatField } from "@/lib/app/lot-format";
import { useUpdateLot } from "@/lib/app/lots";
import { cn } from "@/lib/utils";
import { StatusSelect } from "./LotStatus";

/* Lots as a spreadsheet: a cell opens on click (or Enter), Enter or a click
   elsewhere saves it, Escape cancels, Tab saves and opens the next cell. */

export const CELL_FIELDS = [
  "numero",
  "type",
  "niveau",
  "surface_habitable",
  "surface_terrain",
  "chambres",
  "prix",
] as const;
export type CellField = (typeof CELL_FIELDS)[number];
export type Editing = { id: string; field: CellField } | null;

const NUMERIC = new Set<CellField>(["surface_habitable", "surface_terrain", "chambres", "prix"]);
const COLUMN_LABELS: Record<CellField, string> = {
  numero: "N°",
  type: "Type",
  niveau: "Niveau",
  surface_habitable: "Surface habitable",
  surface_terrain: "Terrain",
  chambres: "Chambres",
  prix: "Prix",
};

type SortKey = CellField | "statut";
type Sort = { key: SortKey; dir: 1 | -1 };

function compareLots(a: Lot, b: Lot, key: SortKey): number {
  if (key === "numero") return compareNumeros(a.numero, b.numero);
  if (key === "statut") return LOT_STATUSES.indexOf(a.statut) - LOT_STATUSES.indexOf(b.statut);
  const x = a[key];
  const y = b[key];
  if (x === y) return 0;
  if (x === null) return 1; // empty values last
  if (y === null) return -1;
  return typeof x === "number" && typeof y === "number"
    ? x - y
    : String(x).localeCompare(String(y), "fr");
}

export function LotsTable({
  projectId,
  lots,
  currency,
  selected,
  onSelectedChange,
  editing,
  onEditingChange,
  onDetails,
  onDelete,
}: {
  projectId: string;
  lots: Lot[];
  currency: string;
  selected: ReadonlySet<string>;
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>;
  editing: Editing;
  onEditingChange: (editing: Editing) => void;
  onDetails: (lot: Lot) => void;
  onDelete: (lot: Lot) => void;
}) {
  const update = useUpdateLot(projectId);
  const [sort, setSort] = useState<Sort>({ key: "numero", dir: 1 });
  const [flash, setFlash] = useState<string | null>(null);
  const focusAfter = useRef<string | null>(null);

  const rows = useMemo(
    () =>
      [...lots].sort(
        (a, b) => sort.dir * compareLots(a, b, sort.key) || compareNumeros(a.numero, b.numero),
      ),
    [lots, sort],
  );

  // Back on the cell once its editor closes, for keyboard users.
  useEffect(() => {
    if (editing || !focusAfter.current) return;
    const cell = document.querySelector<HTMLElement>(`[data-cell="${focusAfter.current}"]`);
    focusAfter.current = null;
    cell?.focus();
  }, [editing]);

  const showSaved = (key: string) => {
    setFlash(key);
    window.setTimeout(() => setFlash((current) => (current === key ? null : current)), 1200);
  };

  const neighbour = (id: string, field: CellField, step: 1 | -1): Editing => {
    const cells = rows.flatMap((lot) => CELL_FIELDS.map((f) => ({ id: lot.id, field: f })));
    const index = cells.findIndex((c) => c.id === id && c.field === field);
    return cells[index + step] ?? null;
  };

  /** Saves a cell; returns the error to show, or null when the editor can close. */
  const commit = (lot: Lot, field: CellField, raw: string, step?: 1 | -1): string | null => {
    const result = parseField(field, raw);
    if (!result.ok) return result.error;
    const value = result.value;
    const clash =
      field === "numero" &&
      lots.find(
        (l) => l.id !== lot.id && l.numero.trim().toLowerCase() === String(value).toLowerCase(),
      );
    if (clash) return `Le lot n° ${clash.numero} existe déjà.`;
    if (value !== lot[field]) {
      const key = `${lot.id}:${field}`;
      update.mutate(
        { id: lot.id, values: { [field]: value } },
        { onSuccess: () => showSaved(key) },
      );
    }
    if (step) onEditingChange(neighbour(lot.id, field, step));
    else {
      focusAfter.current = `${lot.id}:${field}`;
      onEditingChange(null);
    }
    return null;
  };

  const cancel = (lot: Lot, field: CellField) => {
    focusAfter.current = `${lot.id}:${field}`;
    onEditingChange(null);
  };

  const allSelected = rows.length > 0 && rows.every((lot) => selected.has(lot.id));
  const someSelected = !allSelected && rows.some((lot) => selected.has(lot.id));
  const toggle = (id: string, on: boolean) =>
    onSelectedChange((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const header = (key: SortKey, label: string, numeric = false) => {
    const active = sort.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
        className={cn("px-1 py-2 font-medium", numeric && "text-right")}
      >
        <button
          type="button"
          onClick={() => setSort({ key, dir: active ? (sort.dir === 1 ? -1 : 1) : 1 })}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "text-foreground",
            numeric && "flex-row-reverse",
          )}
        >
          {label}
          <Icon className={cn("size-3.5", !active && "opacity-40")} aria-hidden />
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[60rem] border-collapse text-sm">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="w-11 py-2 pl-4 pr-1">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(on) =>
                  onSelectedChange(on === true ? new Set(rows.map((l) => l.id)) : new Set())
                }
                aria-label="Sélectionner tous les lots"
              />
            </th>
            {CELL_FIELDS.map((field) => (
              <Fragment key={field}>
                {header(field, COLUMN_LABELS[field], NUMERIC.has(field))}
              </Fragment>
            ))}
            {header("statut", "Statut")}
            <th scope="col" className="w-12">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((lot) => (
            <tr
              key={lot.id}
              className={cn(
                "border-b border-border/60 last:border-0",
                selected.has(lot.id) ? "bg-primary/[0.06]" : "hover:bg-muted/20",
              )}
            >
              <td className="py-1 pl-4 pr-1">
                <Checkbox
                  checked={selected.has(lot.id)}
                  onCheckedChange={(on) => toggle(lot.id, on === true)}
                  aria-label={`Sélectionner le lot ${lot.numero}`}
                />
              </td>
              {CELL_FIELDS.map((field) => {
                const key = `${lot.id}:${field}`;
                const isEditing = editing?.id === lot.id && editing.field === field;
                const label = `${FIELD_LABELS[field]}, lot ${lot.numero}`;
                return (
                  <td
                    key={field}
                    className={cn(
                      "px-1 py-1",
                      field === "numero" ? "w-24" : NUMERIC.has(field) ? "w-36" : "",
                    )}
                  >
                    {isEditing ? (
                      <CellEditor
                        label={label}
                        initial={fieldInput(field, lot[field])}
                        numeric={NUMERIC.has(field)}
                        list={field === "type" ? "lot-types" : undefined}
                        onCommit={(raw, step) => commit(lot, field, raw, step)}
                        onCancel={() => cancel(lot, field)}
                      />
                    ) : (
                      <CellButton
                        dataCell={key}
                        label={label}
                        text={formatField(field, lot, currency)}
                        numeric={NUMERIC.has(field)}
                        strong={field === "numero"}
                        saved={flash === key}
                        onOpen={() => onEditingChange({ id: lot.id, field })}
                      />
                    )}
                  </td>
                );
              })}
              <td className="px-1 py-1">
                <StatusSelect
                  value={lot.statut}
                  label={`Statut, lot ${lot.numero}`}
                  onChange={(statut) => {
                    if (statut !== lot.statut) {
                      update.mutate(
                        { id: lot.id, values: { statut } },
                        { onSuccess: () => showSaved(`${lot.id}:statut`) },
                      );
                    }
                  }}
                  className={cn(flash === `${lot.id}:statut` && "bg-emerald-500/10")}
                />
              </td>
              <td className="py-1 pr-3 text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Actions du lot ${lot.numero}`}
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onDetails(lot)}>
                      <PanelRightOpen className="size-4" aria-hidden />
                      Détails…
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => onDelete(lot)}
                      className="text-red-300 focus:text-red-200"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Supprimer…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Suggestions of the "Type" inputs (list="lot-types"); rendered once by the page. */
export function LotTypesDatalist() {
  return (
    <datalist id="lot-types">
      {LOT_TYPES.map((t) => (
        <option key={t} value={t} />
      ))}
    </datalist>
  );
}

function CellButton({
  dataCell,
  label,
  text,
  numeric,
  strong,
  saved,
  onOpen,
}: {
  dataCell: string;
  label: string;
  text: string | null;
  numeric: boolean;
  strong: boolean;
  saved: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      data-cell={dataCell}
      onClick={onOpen}
      aria-label={`${label} : ${text ?? "vide"}. Modifier`}
      className={cn(
        "flex h-9 w-full items-center rounded-md px-2.5 text-left transition-colors duration-500 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        numeric && "justify-end tabular-nums",
        strong && "font-medium",
        saved && "bg-emerald-500/15 duration-100",
      )}
    >
      {text ?? <span className="text-muted-foreground/40">—</span>}
    </button>
  );
}

function CellEditor({
  label,
  initial,
  numeric,
  list,
  onCommit,
  onCancel,
}: {
  label: string;
  initial: string;
  numeric: boolean;
  list: string | undefined;
  onCommit: (raw: string, step?: 1 | -1) => string | null;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);

  const save = (step?: 1 | -1) => {
    if (done.current) return;
    const problem = onCommit(value, step);
    if (problem) setError(problem);
    else done.current = true;
  };

  return (
    <div className="relative">
      <Input
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            e.preventDefault();
            done.current = true;
            onCancel();
          } else if (e.key === "Tab") {
            e.preventDefault();
            save(e.shiftKey ? -1 : 1);
          }
        }}
        onBlur={() => {
          if (done.current) return;
          const problem = onCommit(value);
          done.current = true;
          // Clicked elsewhere with an invalid value: keep the old one and say why.
          if (problem) {
            toast.error(problem);
            onCancel();
          }
        }}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        list={list}
        inputMode={numeric ? "decimal" : undefined}
        autoComplete="off"
        className={cn(
          "h-9 px-2.5",
          numeric && "text-right tabular-nums",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {error ? (
        <p
          role="alert"
          className="absolute left-0 top-full z-20 mt-1 w-max max-w-72 rounded-md border border-destructive/40 bg-card px-2.5 py-1.5 text-xs text-red-300 shadow-lg"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
