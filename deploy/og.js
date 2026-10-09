// Link previews of the public programme pages (WhatsApp, iMessage, social
// networks). Their crawlers do not run JavaScript, so the Worker writes the
// title, description and image of the programme, or of the lot, into the
// page it serves. Data comes from the public views of Supabase, with the
// publishable key: prices hidden by the promoter stay hidden here too. In
// French for /p/…, in English for /en/p/… (the promoter's texts in English
// when they have a translation, see src/lib/translations.ts).

const COPY = {
  fr: {
    status: { disponible: "Disponible", reservee: "Réservé", vendue: "Vendu" },
    onRequest: "Prix sur demande",
    bedrooms: (n) => `${n} chambre${n > 1 ? "s" : ""}`,
    plan: "Plan de vente interactif",
    number: "fr-FR",
    og: "fr_FR",
  },
  en: {
    status: { disponible: "Available", reservee: "Reserved", vendue: "Sold" },
    onRequest: "Price on request",
    bedrooms: (n) => `${n} bedroom${n > 1 ? "s" : ""}`,
    plan: "Interactive sales plan",
    number: "en-GB",
    og: "en_GB",
  },
};
const BUCKET = "project-media";

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function money(value, currency, locale = "fr") {
  try {
    return new Intl.NumberFormat(COPY[locale].number, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

const shorten = (text, max) => {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

/** The English version of a text of the promoter, when there is one. */
const translated = (programme, text, locale) => {
  if (!text || locale !== "en") return text;
  const en = programme.translations?.en;
  return (en && typeof en[text.trim()] === "string" && en[text.trim()]) || text;
};

/** Title, description and image of a programme page, or of one of its lots. */
export function previewMeta({ programme, lot, image, url, locale = "fr" }) {
  const copy = COPY[locale];
  const owner = programme.organization_name;
  const city = translated(programme, programme.city, locale);
  if (lot) {
    const status = copy.status[lot.statut] ?? "";
    const price =
      lot.statut === "vendue"
        ? null
        : lot.prix != null
          ? money(lot.prix, programme.currency ?? "EUR", locale)
          : copy.onRequest;
    const area = lot.surface_habitable != null ? `${Math.round(lot.surface_habitable)} m²` : null;
    const rooms = lot.chambres != null ? copy.bedrooms(lot.chambres) : null;
    return {
      title: `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""} — ${programme.name}`,
      description: [status, price, area, rooms, city].filter(Boolean).join(" · "),
      image,
      url,
      site: owner || programme.name,
      locale,
    };
  }
  const description = translated(programme, programme.description, locale);
  return {
    title: owner ? `${programme.name} — ${owner}` : programme.name,
    description: description
      ? shorten(description, 180)
      : [city, copy.plan].filter(Boolean).join(" · "),
    image,
    url,
    site: owner || programme.name,
    locale,
  };
}

/** Tags written at the end of <head> (the shell's own description and og/twitter tags are removed). */
export function metaTags(meta) {
  const tags = [
    ["name", "description", meta.description],
    ["property", "og:type", "website"],
    ["property", "og:locale", COPY[meta.locale ?? "fr"].og],
    ["property", "og:site_name", meta.site],
    ["property", "og:title", meta.title],
    ["property", "og:description", meta.description],
    ["property", "og:url", meta.url],
    ["name", "twitter:card", meta.image ? "summary_large_image" : "summary"],
    ["name", "twitter:title", meta.title],
    ["name", "twitter:description", meta.description],
  ];
  if (meta.image) {
    tags.push(["property", "og:image", meta.image], ["name", "twitter:image", meta.image]);
  }
  return tags
    .map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escapeHtml(value)}"/>`)
    .join("");
}

const withSuffix = (path, suffix) => path.replace(/(\.[a-z0-9]+)$/i, `${suffix}$1`);

/** Reads the programme (and lot) from Supabase; null when it is not published. */
export async function loadPreview(env, slug, numero, pageUrl, locale = "fr") {
  const rest = async (query) => {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: { apikey: env.SUPABASE_KEY, accept: "application/json" },
      // A minute of cache: previews follow status changes closely enough.
      cf: { cacheTtl: 60, cacheEverything: true },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return res.json();
  };

  const [programme] = await rest(
    `public_projects?slug=eq.${encodeURIComponent(slug)}&select=id,name,city,description,currency,organization_name,cover_media_id,translations&limit=1`,
  );
  if (!programme) return null;

  const [lots, media, views, firsts] = await Promise.all([
    numero
      ? rest(
          `public_lots?project_id=eq.${programme.id}&numero=eq.${encodeURIComponent(numero)}&select=id,numero,type,statut,prix,surface_habitable,chambres&limit=1`,
        )
      : Promise.resolve([]),
    rest(
      `media?project_id=eq.${programme.id}&kind=eq.image&select=id,path,lot_id,lot_type&order=sort_order&limit=50`,
    ),
    // For programmes without photos: the first image of the main view (else of the first one).
    rest(`project_views?project_id=eq.${programme.id}&select=id&order=is_main.desc,sort_order.asc`),
    rest(
      `media?project_id=eq.${programme.id}&kind=eq.orbit_frame&sort_order=eq.0&select=path,view_id`,
    ),
  ]);
  const lot = lots[0] ?? null;

  // The lot's photo, else the photo chosen for the top of the page (else the
  // programme's first photo, as on the page: coverPhoto), else its main view.
  const photo =
    (lot && media.find((m) => m.lot_id === lot.id)) ||
    media.find((m) => m.id === programme.cover_media_id) ||
    media.find((m) => !m.lot_id && !m.lot_type) ||
    media[0];
  const frame = views.map((v) => firsts.find((f) => f.view_id === v.id)).find(Boolean);
  const path = photo
    ? withSuffix(photo.path, "-800")
    : frame
      ? withSuffix(frame.path, "-1280")
      : null;
  const image = path ? `${env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` : null;

  return previewMeta({ programme, lot, image, url: pageUrl, locale });
}
