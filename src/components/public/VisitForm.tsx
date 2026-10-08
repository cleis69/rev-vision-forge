import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import type { PublicLot } from "@/lib/public/programme";
import {
  VisitError,
  checkVisit,
  sendVisit,
  type VisitErrors,
  type VisitSource,
  type VisitValues,
} from "@/lib/public/visit";
import { cn } from "@/lib/utils";

const EMPTY: VisitValues = { nom: "", telephone: "", email: "", message: "" };
const PROGRAMME = "";

/** "Planifier une visite": name, WhatsApp phone, optional e-mail and message. */
export function VisitForm({
  projectId,
  slug,
  owner,
  lots,
  lot,
  preview,
  source = "page",
  onSent,
}: {
  projectId: string;
  slug: string;
  owner: string;
  /** Lots the visitor can pick (the form of a lot sheet passes none). */
  lots?: PublicLot[];
  /** Lot the request is about, when it comes from a lot sheet. */
  lot?: PublicLot | null;
  preview: boolean;
  source?: VisitSource;
  onSent?: () => void;
}) {
  const id = useId();
  const [values, setValues] = useState(EMPTY);
  const [lotId, setLotId] = useState<string>(lot?.id ?? PROGRAMME);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<VisitErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const set = (field: keyof VisitValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFailure(null);
    const found = checkVisit(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      // A robot that filled the invisible field gets the same answer, and nothing is sent.
      if (!trap) await sendVisit(projectId, lot?.id ?? (lotId || null), values, source);
      setState("sent");
      onSent?.();
    } catch (error) {
      setState("idle");
      setFailure(
        error instanceof VisitError
          ? error.message
          : "L'envoi a échoué. Réessayez dans un instant.",
      );
    }
  };

  if (state === "sent") {
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        role="status"
      >
        <CheckCircle2 className="size-7 text-[color:var(--brand)]" aria-hidden />
        <p className="font-display text-xl font-medium tracking-tight">Demande envoyée.</p>
        <p className="text-sm leading-relaxed text-white/65">
          {owner ? `${owner} vous recontactera` : "Vous serez recontacté"} rapidement, par téléphone
          ou sur WhatsApp.
        </p>
      </div>
    );
  }

  const choosable = (lots ?? []).filter((l) => l.statut !== "vendue");

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {lot ? null : choosable.length > 0 ? (
        <Field id={`${id}-lot`} label="Lot qui vous intéresse" optional>
          <select
            id={`${id}-lot`}
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className={inputClass}
          >
            <option value={PROGRAMME}>Le programme en général</option>
            {choosable.map((l) => (
              <option key={l.id} value={l.id}>
                Lot {l.numero}
                {l.type ? ` · ${l.type}` : ""}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-nom`} label="Nom" error={errors.nom}>
          <input
            id={`${id}-nom`}
            value={values.nom}
            onChange={(e) => set("nom")(e.target.value)}
            autoComplete="name"
            aria-invalid={errors.nom ? true : undefined}
            aria-describedby={errors.nom ? `${id}-nom-error` : undefined}
            className={inputClass}
          />
        </Field>
        <Field id={`${id}-telephone`} label="Téléphone (WhatsApp)" error={errors.telephone}>
          <input
            id={`${id}-telephone`}
            type="tel"
            inputMode="tel"
            value={values.telephone}
            onChange={(e) => set("telephone")(e.target.value)}
            autoComplete="tel"
            placeholder="+212 6 12 34 56 78"
            aria-invalid={errors.telephone ? true : undefined}
            aria-describedby={errors.telephone ? `${id}-telephone-error` : undefined}
            className={inputClass}
          />
        </Field>
      </div>
      <Field id={`${id}-email`} label="E-mail" optional error={errors.email}>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
          className={inputClass}
        />
      </Field>
      <Field id={`${id}-message`} label="Message" optional error={errors.message}>
        <textarea
          id={`${id}-message`}
          rows={3}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Vos disponibilités, vos questions…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={cn(inputClass, "h-auto py-3")}
        />
      </Field>

      {/* Invisible to people; robots that fill every field give themselves away. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${id}-site`}>Ne pas remplir</label>
        <input
          id={`${id}-site`}
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      {failure ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {failure}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending" || preview}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-6 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {state === "sending" ? "Envoi…" : "Planifier une visite"}
      </button>
      {preview ? (
        <p className="text-xs text-amber-300">
          Formulaire désactivé dans l'aperçu : publiez le programme pour recevoir des demandes.
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-white/45">
        Vos coordonnées sont transmises à {owner || "l'équipe commerciale du programme"} pour vous
        recontacter au sujet de ce programme.{" "}
        <Link
          to="/p/$slug/donnees-personnelles"
          params={{ slug }}
          resetScroll={false}
          className="text-white/70 underline underline-offset-4 hover:text-white"
        >
          Données personnelles
        </Link>
      </p>
    </form>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 aria-[invalid]:border-red-400/70";

function Field({
  id,
  label,
  optional = false,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-white/80">
        {label}
        {optional ? <span className="text-white/40"> (facultatif)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
