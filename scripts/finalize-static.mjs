// After `STATIC_BUILD=1 vite build`: turn dist/client into a clean static site.
// - /about/index.html → /about.html, /en/index.html → /en.html,
//   /en/pricing/index.html → /en/pricing.html (served without a redirect)
// - /404.html and /en/404.html: the host's not-found page for each language,
//   with the address rewritten so the app hydrates on the matching route
// - sitemap.xml (with hreflang alternates read from each page) + robots.txt
import { existsSync, readFileSync, readdirSync, renameSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const SITE = "https://realestatevision360.com";
const root = join(import.meta.dirname, "..", "dist", "client");

/** Flatten `dir/index.html` → `dir.html`, deepest folders first. */
const flatten = (dir) => {
  for (const name of readdirSync(dir)) {
    const child = join(dir, name);
    if (statSync(child).isDirectory()) flatten(child);
  }
  const index = join(dir, "index.html");
  if (dir === root || !existsSync(index)) return;
  renameSync(index, `${dir}.html`);
  if (readdirSync(dir).length === 0) rmdirSync(dir);
};
flatten(root);

/** Every page's URL path, from its .html file. */
const pages = [];
const collect = (dir) => {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) {
      if (name !== "assets" && name !== "media") collect(file);
      continue;
    }
    if (!name.endsWith(".html")) continue;
    const rel = relative(root, file).split("\\").join("/");
    if (rel === "404.html" || rel.endsWith("/404.html") || rel === "_shell.html") continue;
    // Private pages (noindex) stay out of the sitemap.
    if (/<meta name="robots" content="noindex/.test(readFileSync(file, "utf8"))) continue;
    pages.push(rel === "index.html" ? "/" : `/${rel.replace(/\.html$/, "")}`);
  }
};
collect(root);
pages.sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

const fileFor = (page) => join(root, page === "/" ? "index.html" : `${page.slice(1)}.html`);
const alternates = (page) => {
  const html = readFileSync(fileFor(page), "utf8");
  const links = [];
  for (const tag of html.match(/<link[^>]+rel="alternate"[^>]*>/g) ?? []) {
    const lang = tag.match(/hreflang="([^"]+)"/i)?.[1];
    const url = tag.match(/href="([^"]+)"/)?.[1];
    if (lang && url) links.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`);
  }
  return links;
};

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map((p) =>
    [
      "  <url>",
      `    <loc>${SITE}${p}</loc>`,
      ...alternates(p),
      `    <lastmod>${today}</lastmod>`,
      "  </url>",
    ].join("\n"),
  )
  .join("\n")}
</urlset>
`,
);
writeFileSync(
  join(root, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /app\n\nSitemap: ${SITE}/sitemap.xml\n`,
);
if (!existsSync(join(root, "_shell.html"))) throw new Error("missing _shell.html (SPA shell of /app)");

// Media sizes for the range-serving Worker (deploy/worker.js).
const sizes = {};
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else sizes[`/${relative(root, file).split("\\").join("/")}`] = statSync(file).size;
  }
};
walk(join(root, "media"));
writeFileSync(
  join(import.meta.dirname, "..", "deploy", "media-sizes.json"),
  `${JSON.stringify(sizes, null, 0)}\n`,
);

// The host serves these files for unknown URLs. They were prerendered for
// /404 and /en/404, so the router must boot on that path or hydration fails
// and the page goes blank: rewrite the address before any script runs.
for (const [file, path] of [
  ["404.html", "/404"],
  ["en/404.html", "/en/404"],
]) {
  const target = join(root, file);
  if (!existsSync(target)) throw new Error(`missing not-found page: ${file}`);
  const html = readFileSync(target, "utf8");
  const fix = `<script>if(location.pathname!=="${path}")history.replaceState(history.state,"","${path}")</script>`;
  writeFileSync(target, html.replace("<head>", `<head>${fix}`));
}
console.log(`static site ready: ${pages.length} pages + 2 not-found pages\n${pages.join(" ")}`);
