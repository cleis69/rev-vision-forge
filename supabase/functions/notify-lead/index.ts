// notify-lead — e-mail to the members of the organization for every new
// visit request. Called by the trigger leads_notify_new (pg_net) with
// { lead_id }. It only handles a request created in the last 10 minutes and
// not notified yet, so a call from anywhere else cannot make it send anything
// more. Without RESEND_API_KEY (e-mail service not chosen yet), it sends
// nothing and says so.
//
// Secrets (supabase secrets set …): RESEND_API_KEY, and optionally
// NOTIFY_FROM (default "REV <notifications@realestatevision360.com>").

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE = "https://realestatevision360.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** International number for wa.me: digits only, "00" prefix dropped. */
const whatsappDigits = (phone: string) =>
  phone
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let leadId: unknown;
  try {
    ({ lead_id: leadId } = await req.json());
  } catch {
    return json({ error: "body" }, 400);
  }
  if (typeof leadId !== "string" || !/^[0-9a-f-]{36}$/i.test(leadId))
    return json({ error: "lead_id" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false },
    },
  );

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, created_at, nom, telephone, email, message, source, project_id, lot_id")
    .eq("id", leadId)
    .is("notified_at", null)
    .gte("created_at", since)
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!lead) return json({ status: "ignored" });

  const [{ data: project }, { data: lot }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, slug, organization_id")
      .eq("id", lead.project_id)
      .single(),
    lead.lot_id
      ? supabase.from("lots").select("numero, type").eq("id", lead.lot_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!project) return json({ status: "ignored" });

  const { data: members } = await supabase
    .from("members")
    .select("user_id")
    .eq("organization_id", project.organization_id);
  const users = await Promise.all(
    (members ?? []).map((m) => supabase.auth.admin.getUserById(m.user_id)),
  );
  const recipients = users.map((u) => u.data.user?.email).filter((e): e is string => Boolean(e));

  const key = Deno.env.get("RESEND_API_KEY");
  if (!key)
    return json({ status: "skipped", reason: "no e-mail service", recipients: recipients.length });
  if (recipients.length === 0) return json({ status: "skipped", reason: "no recipient" });

  const lotLabel = lot ? `lot ${lot.numero}${lot.type ? ` (${lot.type})` : ""}` : null;
  const subject = `Nouvelle demande de visite — ${lotLabel ? `${lotLabel[0].toUpperCase()}${lotLabel.slice(1)} · ` : ""}${project.name}`;
  const inbox = `${SITE}/app/projets/${project.id}/demandes`;
  const digits = whatsappDigits(lead.telephone);
  const whatsapp = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Bonjour ${lead.nom}, suite à votre demande de visite${lotLabel ? ` du ${lotLabel}` : ""} du programme ${project.name}…`,
  )}`;

  const rows: [string, string][] = [
    ["Programme", project.name],
    ...(lotLabel ? ([["Lot", lotLabel]] as [string, string][]) : []),
    ["Nom", lead.nom],
    ["Téléphone", lead.telephone],
    ...(lead.email ? ([["E-mail", lead.email]] as [string, string][]) : []),
    ...(lead.message ? ([["Message", lead.message]] as [string, string][]) : []),
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p>Nouvelle demande de visite reçue sur la page du programme.</p>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top">${k}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>
<p><a href="${whatsapp}">Répondre sur WhatsApp</a> · <a href="${inbox}">Voir les demandes</a></p>
</div>`;
  const text = `${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\nRépondre sur WhatsApp : ${whatsapp}\nVoir les demandes : ${inbox}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("NOTIFY_FROM") ?? "REV <notifications@realestatevision360.com>",
      to: recipients,
      subject,
      html,
      text,
      ...(lead.email ? { reply_to: lead.email } : {}),
    }),
  });
  if (!res.ok) return json({ status: "error", code: res.status, detail: await res.text() }, 502);

  await supabase.from("leads").update({ notified_at: new Date().toISOString() }).eq("id", lead.id);
  return json({ status: "sent", recipients: recipients.length });
});
