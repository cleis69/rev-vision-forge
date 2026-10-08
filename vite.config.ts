// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// STATIC_BUILD=1 prerenders every route to plain HTML for Cloudflare
// (realestatevision360.com). Lovable builds leave it unset and keep SSR.
const isStatic = process.env["STATIC_BUILD"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isStatic
      ? {
          prerender: {
            enabled: true,
            crawlLinks: true,
            failOnError: true,
            // /app, /p and /embed pages are rendered in the browser from the shell below.
            filter: ({ path }: { path: string }) =>
              !path.startsWith("/app/") &&
              !["/p", "/embed"].includes(path) &&
              !path.startsWith("/p/") &&
              !path.startsWith("/embed/"),
          },
          // Not linked from anywhere, so not found by the crawler. The AI agent
          // page is private for now (PRIVATE_PAGES in src/lib/i18n.ts).
          pages: [
            { path: "/404" },
            { path: "/en/404" },
            { path: "/agent-ia" },
            { path: "/en/ai-agent" },
          ],
          // Empty page for the browser-only promoter space: the Worker serves
          // it for every /app/… address and the router takes over.
          // (rendered at /app, so it does not take the place of the home page).
          spa: { enabled: true, maskPath: "/app" },
        }
      : {}),
  },
  ...(isStatic ? { nitro: false as const } : {}),
  vite: {
    // Photos are listed in one module (src/lib/images.ts): never inline them
    // as base64 there, or every page using a photo would download them all.
    build: { assetsInlineLimit: (file: string) => (file.endsWith(".webp") ? false : undefined) },
  },
});
