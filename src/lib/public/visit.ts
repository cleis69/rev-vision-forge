import { getSupabase } from "@/lib/supabase/client";
import { sessionId } from "./events";

/* Visit requests from the public page, saved by public.submit_lead (published
   programme, rate limited per tab and per IP). Same limits as the leads table. */

export type VisitValues = { nom: string; telephone: string; email: string; message: string };
export type VisitErrors = Partial<Record<keyof VisitValues, string>>;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/** Problems to show under the fields; empty when the request can be sent. */
export function checkVisit(values: VisitValues): VisitErrors {
  const errors: VisitErrors = {};
  const nom = values.nom.trim();
  if (nom.length < 2) errors.nom = "Indiquez votre nom.";
  else if (nom.length > 120) errors.nom = "120 caractères au maximum.";

  const phone = values.telephone.trim();
  const digits = phone.replace(/\D/g, "").length;
  if (!phone) errors.telephone = "Indiquez un numéro pour être recontacté.";
  else if (!/^\+?[\d\s().-]+$/.test(phone) || digits < 8 || digits > 15 || phone.length > 30) {
    errors.telephone = "Numéro invalide, par exemple +212 6 12 34 56 78.";
  }

  const email = values.email.trim();
  if (email && (email.length > 254 || !EMAIL.test(email)))
    errors.email = "Adresse e-mail invalide.";

  if (values.message.trim().length > 2000) errors.message = "2 000 caractères au maximum.";
  return errors;
}

export type VisitSource = "page" | "embed" | "presentation";

export class VisitError extends Error {}

/** Sends the request; the error message is ready to show. */
export async function sendVisit(
  projectId: string,
  lotId: string | null,
  values: VisitValues,
  source: VisitSource = "page",
): Promise<void> {
  const { error } = await getSupabase().rpc("submit_lead", {
    p_project_id: projectId,
    p_nom: values.nom.trim(),
    p_telephone: values.telephone.trim(),
    p_session_id: sessionId(),
    ...(lotId ? { p_lot_id: lotId } : {}),
    ...(values.email.trim() ? { p_email: values.email.trim() } : {}),
    ...(values.message.trim() ? { p_message: values.message.trim() } : {}),
    p_source: source,
  });
  if (error) {
    if (error.hint === "rate_limited") throw new VisitError(error.message);
    if (error.code === "P0002")
      throw new VisitError("Ce programme n'accepte plus de demandes pour le moment.");
    if (error.code === "23514") throw new VisitError("Une information saisie n'est pas valide.");
    throw new VisitError("L'envoi a échoué. Vérifiez votre connexion puis réessayez.");
  }
}
