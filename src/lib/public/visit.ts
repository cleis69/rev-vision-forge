import { getSupabase } from "@/lib/supabase/client";
import { sessionId } from "./events";
import type { Locale } from "./i18n";

/* Visit requests from the public page, saved by public.submit_lead (published
   programme, rate limited per tab and per IP). Same limits as the leads table. */

export type VisitValues = { nom: string; telephone: string; email: string; message: string };
export type VisitErrors = Partial<Record<keyof VisitValues, string>>;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const MESSAGES = {
  fr: {
    name: "Indiquez votre nom.",
    nameLong: "120 caractères au maximum.",
    phone: "Indiquez un numéro pour être recontacté.",
    phoneInvalid: "Numéro invalide, par exemple +212 6 12 34 56 78.",
    email: "Adresse e-mail invalide.",
    messageLong: "2 000 caractères au maximum.",
    rateLimited: null,
    closed: "Ce programme n'accepte plus de demandes pour le moment.",
    invalid: "Une information saisie n'est pas valide.",
    failed: "L'envoi a échoué. Vérifiez votre connexion puis réessayez.",
  },
  en: {
    name: "Enter your name.",
    nameLong: "120 characters maximum.",
    phone: "Enter a number so you can be contacted.",
    phoneInvalid: "Invalid number, e.g. +212 6 12 34 56 78.",
    email: "Invalid email address.",
    messageLong: "2,000 characters maximum.",
    // The French one is the database's own message.
    rateLimited: "Too many requests sent. Try again in an hour.",
    closed: "This programme is not accepting requests at the moment.",
    invalid: "Some of the information entered is not valid.",
    failed: "Sending failed. Check your connection, then try again.",
  },
} satisfies Record<Locale, Record<string, string | null>>;

/** Problems to show under the fields; empty when the request can be sent. */
export function checkVisit(values: VisitValues, locale: Locale = "fr"): VisitErrors {
  const text = MESSAGES[locale];
  const errors: VisitErrors = {};
  const nom = values.nom.trim();
  if (nom.length < 2) errors.nom = text.name;
  else if (nom.length > 120) errors.nom = text.nameLong;

  const phone = values.telephone.trim();
  const digits = phone.replace(/\D/g, "").length;
  if (!phone) errors.telephone = text.phone;
  else if (!/^\+?[\d\s().-]+$/.test(phone) || digits < 8 || digits > 15 || phone.length > 30) {
    errors.telephone = text.phoneInvalid;
  }

  const email = values.email.trim();
  if (email && (email.length > 254 || !EMAIL.test(email))) errors.email = text.email;

  if (values.message.trim().length > 2000) errors.message = text.messageLong;
  return errors;
}

export type VisitSource = "page" | "embed" | "presentation";

export class VisitError extends Error {}

/**
 * Sends the request; the error message is ready to show, in `locale`. `session` replaces
 * the id of the tab: the sales office tablet gives one to each visitor, so the
 * limit per visitor does not stop the next one.
 */
export async function sendVisit(
  projectId: string,
  lotId: string | null,
  values: VisitValues,
  source: VisitSource = "page",
  session: string = sessionId(),
  locale: Locale = "fr",
): Promise<void> {
  const { error } = await getSupabase().rpc("submit_lead", {
    p_project_id: projectId,
    p_nom: values.nom.trim(),
    p_telephone: values.telephone.trim(),
    p_session_id: session,
    ...(lotId ? { p_lot_id: lotId } : {}),
    ...(values.email.trim() ? { p_email: values.email.trim() } : {}),
    ...(values.message.trim() ? { p_message: values.message.trim() } : {}),
    p_source: source,
  });
  if (error) {
    const text = MESSAGES[locale];
    if (error.hint === "rate_limited") throw new VisitError(text.rateLimited ?? error.message);
    if (error.code === "P0002") throw new VisitError(text.closed);
    if (error.code === "23514") throw new VisitError(text.invalid);
    throw new VisitError(text.failed);
  }
}
