import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection } from "@/components/app/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { dbErrorMessage } from "@/lib/app/errors";
import { useUpdateProject, type Project } from "@/lib/app/projects";
import {
  MAX_PAYMENT_LABEL,
  MAX_PAYMENT_NOTE,
  MAX_PAYMENT_STEPS,
  PAYMENT_TEMPLATE,
  parsePaymentPlan,
  parseRental,
  planTotal,
  type PaymentStep,
} from "@/lib/payment-plan";

/* Réglages: how a buyer pays (shown on each lot sheet with the amounts), and
   the values that start the yield simulator of the lot sheets. */

type Row = { key: number; label: string; percent: string };
let nextKey = 1;
const toRow = (s: PaymentStep): Row => ({
  key: nextKey++,
  label: s.label,
  percent: String(s.percent),
});
const toNumber = (input: string) => {
  const n = Number(input.replace(",", ".").replace(/\s/g, ""));
  return input.trim() && Number.isFinite(n) ? n : null;
};
const percentText = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export function PaymentSettings({ project }: { project: Project }) {
  const update = useUpdateProject(project.id);
  const initialPlan = useMemo(() => parsePaymentPlan(project.payment_plan), [project.payment_plan]);
  const initialRental = useMemo(() => parseRental(project.rental), [project.rental]);
  const [rows, setRows] = useState<Row[]>(() => initialPlan.map(toRow));
  const [note, setNote] = useState(project.payment_note ?? "");
  const [nightly, setNightly] = useState(initialRental.nightly?.toString() ?? "");
  const [occupancy, setOccupancy] = useState(initialRental.occupancy?.toString() ?? "");
  const [charges, setCharges] = useState(initialRental.charges?.toString() ?? "");

  const plan = rows.flatMap((r): PaymentStep[] => {
    const percent = toNumber(r.percent);
    return r.label.trim() && percent !== null && percent > 0 && percent <= 100
      ? [{ label: r.label.trim(), percent }]
      : [];
  });
  const incomplete = rows.length !== plan.length;
  const total = planTotal(plan);
  const rental = {
    ...(toNumber(nightly) !== null ? { nightly: toNumber(nightly) as number } : {}),
    ...(toNumber(occupancy) !== null ? { occupancy: toNumber(occupancy) as number } : {}),
    ...(toNumber(charges) !== null ? { charges: toNumber(charges) as number } : {}),
  };
  const rentalProblem =
    (rental.nightly !== undefined && rental.nightly <= 0) ||
    (rental.occupancy !== undefined && (rental.occupancy < 0 || rental.occupancy > 100)) ||
    (rental.charges !== undefined && (rental.charges < 0 || rental.charges > 90));

  const change = (key: number, values: Partial<Row>) =>
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
      { payment_plan: plan, payment_note: note.trim() || null, rental },
      {
        onSuccess: (saved) => {
          setRows(parsePaymentPlan(saved.payment_plan).map(toRow));
          toast.success("Paiement et rentabilité enregistrés");
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  return (
    <SettingsSection
      title="Paiement et rentabilité"
      anchor="paiement"
      description="Sur la fiche de chaque lot : comment l'acheteur paie, étape par étape, avec le montant de chaque étape ; et un simulateur de rentabilité locative, quand vous indiquez un loyer par nuit."
    >
      <h3 className="text-sm font-medium">Échéancier de paiement</h3>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <li key={row.key} className="flex items-center gap-2">
              <Input
                value={row.label}
                onChange={(e) =>
                  change(row.key, { label: e.target.value.slice(0, MAX_PAYMENT_LABEL) })
                }
                placeholder="Étape (ex. Gros œuvre achevé)"
                aria-label="Étape"
                className="h-11 min-w-0 flex-1"
              />
              <div className="relative w-24 shrink-0">
                <Input
                  value={row.percent}
                  onChange={(e) => change(row.key, { percent: e.target.value })}
                  inputMode="decimal"
                  aria-label={`Part du prix, ${row.label || "étape"}`}
                  className="h-11 pr-7 text-right tabular-nums"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
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
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Aucun échéancier : la fiche des lots n'en montre pas.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {rows.length < MAX_PAYMENT_STEPS ? (
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setRows((list) => [...list, toRow({ label: "", percent: 10 })])}
          >
            <Plus aria-hidden />
            Ajouter une étape
          </Button>
        ) : null}
        {rows.length === 0 ? (
          <Button
            variant="ghost"
            className="h-9"
            onClick={() => setRows(PAYMENT_TEMPLATE.map(toRow))}
          >
            Partir d'un échéancier qui suit les travaux
          </Button>
        ) : null}
        {plan.length > 0 ? (
          <span
            className={total === 100 ? "text-sm text-muted-foreground" : "text-sm text-amber-300"}
            role="status"
          >
            Total : {percentText.format(total)} %
            {total === 100 ? "" : " · le total devrait faire 100 %"}
          </span>
        ) : null}
      </div>
      {incomplete ? (
        <p className="mt-2 text-xs text-amber-300">
          Une étape sans intitulé ou sans part entre 0 et 100 % ne sera pas enregistrée.
        </p>
      ) : null}

      <label className="mt-5 block">
        <span className="text-sm font-medium">Note sous l'échéancier</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_PAYMENT_NOTE))}
          rows={2}
          placeholder="Ex. Les versements suivent l'avancement des travaux, selon le contrat de vente en l'état futur d'achèvement."
          className="mt-2"
        />
      </label>

      <h3 className="mt-8 text-sm font-medium">Simulateur de rentabilité locative</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Les valeurs de départ ; l'acheteur les change sur la fiche. Sans loyer par nuit, le
        simulateur n'apparaît pas.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Loyer par nuit ({project.currency})</span>
          <Input
            value={nightly}
            onChange={(e) => setNightly(e.target.value)}
            inputMode="decimal"
            placeholder="ex. 3500"
            className="mt-1 h-11 tabular-nums"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Taux d'occupation (%)</span>
          <Input
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            inputMode="decimal"
            placeholder="55"
            className="mt-1 h-11 tabular-nums"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Charges et gestion (% des loyers)</span>
          <Input
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            inputMode="decimal"
            placeholder="30"
            className="mt-1 h-11 tabular-nums"
          />
        </label>
      </div>
      {rentalProblem ? (
        <p className="mt-2 text-xs text-amber-300">
          Le loyer doit être positif, l'occupation entre 0 et 100 %, les charges entre 0 et 90 %.
        </p>
      ) : null}

      <div className="mt-6">
        <Button onClick={save} disabled={update.isPending || rentalProblem} className="h-11">
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </SettingsSection>
  );
}
