import type { Locale } from "./i18n";

/* Sales plan on the promoter's own website: /embed/$slug (/en/embed/$slug in
   English) in an iframe. The page sends its height to the parent page, whose
   small script resizes the iframe, so there is never a scroll bar inside it. */

export const HEIGHT_MESSAGE = "rev-plan:height";

export type HeightMessage = { type: typeof HEIGHT_MESSAGE; slug: string; height: number };

const attr = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TITLE: Record<Locale, string> = { fr: "Plan de vente", en: "Sales plan" };

/** HTML to paste on the promoter's site: the iframe and the script that adjusts its height. */
export function embedCode(
  origin: string,
  slug: string,
  programme: string,
  locale: Locale = "fr",
): string {
  const src = `${origin}${locale === "en" ? "/en" : ""}/embed/${encodeURIComponent(slug)}`;
  // Only messages from our pages, and only to the iframe that sent them.
  const script = [
    "(function(){",
    `window.addEventListener("message",function(e){`,
    `if(e.origin!==${JSON.stringify(origin)}||!e.data||e.data.type!==${JSON.stringify(HEIGHT_MESSAGE)})return;`,
    `var f=document.querySelectorAll("iframe[data-rev-plan]");`,
    `for(var i=0;i<f.length;i++)if(f[i].contentWindow===e.source)f[i].style.height=Math.ceil(e.data.height)+"px";`,
    "});",
    "})();",
  ].join("");
  return [
    `<iframe src="${attr(src)}" title="${attr(`${TITLE[locale]} — ${programme}`)}" data-rev-plan loading="lazy" allow="clipboard-write; web-share" style="display:block;width:100%;height:720px;border:0"></iframe>`,
    `<script>${script}</script>`,
  ].join("\n");
}
