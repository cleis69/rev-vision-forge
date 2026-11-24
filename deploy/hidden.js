/*
 * The site is hidden (owner's request, 2026-11-20): every address of the
 * domain answers 404 with an empty black page, so search engines drop it too.
 * Since 2026-11-24 the programmes listed in OPEN_ONLY stay open (City Star:
 * its page, 360° tour, lot pages and embedded plan), see deploy/worker.js.
 * Deployed with deploy/wrangler-hidden.jsonc. To reopen the whole site,
 * deploy the normal config again (deploy/wrangler.jsonc).
 */

const PAGE = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="dark">
<title>404</title>
<style>
  html, body { height: 100%; margin: 0; background: #000; }
  body { display: grid; place-items: center; color: #5a5a5a;
    font: 500 15px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    letter-spacing: 0.02em; }
</style>
</head>
<body>404</body>
</html>
`;

export function hiddenPage(request) {
  return new Response(request.method === "HEAD" ? null : PAGE, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
