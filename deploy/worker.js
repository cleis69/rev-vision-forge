// Runs before static assets for three things only:
// - /media/*: byte-range responses — Safari (iPhone, iPad, Mac) only plays
//   video that is served in 206 partial responses.
// - private pages (PRIVATE_PAGES in src/lib/i18n.ts): a password prompt. The
//   password is the Worker secret AGENT_PASSWORD; while it is not set, the
//   pages stay closed to everyone.
// - /app/…: the promoter space, and /p/…: the public pages of the programmes,
//   both rendered in the browser from the SPA shell (_shell.html).
// Everything else on the site is served straight from static assets.
import SIZES from "./media-sizes.json";

const PRIVATE = /^\/(agent-ia|en\/ai-agent)(\.html|\/)?$/;
// Promoter space and public programme pages: rendered in the browser from the
// SPA shell of the build, never indexed (programmes are shared by link).
const APP = /^\/app(\/|$)/;
const PROGRAMME = /^\/p\/[^/]+/;

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (PRIVATE.test(pathname)) return privatePage(request, env);
    if (APP.test(pathname) || PROGRAMME.test(pathname)) return appShell(request, env);

    const res = await env.ASSETS.fetch(request);
    const range = request.headers.get("range");
    if (!range || request.method !== "GET" || res.status !== 200 || !res.body) {
      return withMediaHeaders(res);
    }

    const path = decodeURIComponent(new URL(request.url).pathname);
    const size = Number(res.headers.get("content-length")) || SIZES[path] || 0;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim()); // a single range only
    if (!size || !match || (match[1] === "" && match[2] === "")) return withMediaHeaders(res);

    let start;
    let end;
    if (match[1] === "") {
      start = Math.max(0, size - Number(match[2]));
      end = size - 1;
    } else {
      start = Number(match[1]);
      end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
    }

    if (start >= size || start > end) {
      await res.body.cancel();
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    }

    const headers = mediaHeaders(res.headers);
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    return new Response(res.body.pipeThrough(slice(start, end)), { status: 206, headers });
  },
};

function mediaHeaders(source) {
  const headers = new Headers(source);
  headers.set("accept-ranges", "bytes");
  // URLs carry ?v=<MEDIA_VERSION>, bumped on every re-encode: safe to keep for a year.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return headers;
}

function withMediaHeaders(res) {
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: mediaHeaders(res.headers) });
}

/** Passes through bytes start..end (inclusive) of a stream, then stops reading. */
function slice(start, end) {
  let pos = 0;
  return new TransformStream({
    transform(chunk, controller) {
      const chunkStart = pos;
      const chunkEnd = pos + chunk.byteLength;
      pos = chunkEnd;
      if (chunkEnd <= start) return;
      const from = Math.max(0, start - chunkStart);
      const to = Math.min(chunk.byteLength, end - chunkStart + 1);
      if (to > from) controller.enqueue(chunk.subarray(from, to));
      if (chunkEnd > end) controller.terminate();
    },
  });
}

async function appShell(request, env) {
  const res = await env.ASSETS.fetch(new Request(new URL("/_shell", request.url), request));
  const headers = new Headers(res.headers);
  headers.set("cache-control", "no-cache");
  headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

async function privatePage(request, env) {
  if (!(await allowed(request, env.AGENT_PASSWORD))) {
    return new Response("Accès réservé — Restricted access", {
      status: 401,
      headers: {
        "www-authenticate": 'Basic realm="REV", charset="UTF-8"',
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }
  const res = await env.ASSETS.fetch(request);
  const headers = new Headers(res.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/** HTTP Basic auth: any user name, the password must match (compared in constant time). */
async function allowed(request, password) {
  if (!password) return false;
  const [scheme, encoded] = (request.headers.get("authorization") ?? "").split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  let decoded;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
  } catch {
    return false;
  }
  const given = decoded.slice(decoded.indexOf(":") + 1);
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(password)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}
