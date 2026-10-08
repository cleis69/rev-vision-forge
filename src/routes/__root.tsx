import {
  Outlet,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import groteskLatin from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE_URL } from "@/lib/contact";
import { href, useLocale } from "@/lib/i18n";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { SiteChrome } from "@/components/rev/SiteChrome";

const ERROR_COPY = {
  fr: {
    title: "Cette page ne s'est pas chargée",
    body: "Une erreur est survenue de notre côté. Réessayez ou revenez à l'accueil.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  en: {
    title: "This page didn't load",
    body: "Something went wrong on our end. You can try again or head back home.",
    retry: "Try again",
    home: "Back to home",
  },
} as const;

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const locale = useLocale();
  const copy = ERROR_COPY[locale];
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {copy.retry}
          </button>
          <a
            href={href("home", locale)}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {copy.home}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "REV — Real Estate Vision" },
      {
        name: "description",
        content:
          "Agence de croissance immobilière : production visuelle premium, marketing, acquisition et automatisation.",
      },
      { property: "og:site_name", content: "REV — Real Estate Vision" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og.jpg` },
      { name: "theme-color", content: "#090909" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Latin subsets of the two self-hosted fonts, needed for the first paint.
      { rel: "preload", href: interLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: groteskLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <head>
        <HeadContent />
        {/* Scroll reveals need JavaScript; without it, show everything. */}
        <noscript>
          <style>{".reveal-init,[data-split-part]{opacity:1!important;transform:none!important;filter:none!important}"}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// The showcase site (routes/_site) and the promoter space (routes/app) each
// bring their own layout.
function RootComponent() {
  /* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */
  return <Outlet />;
}

function NotFound() {
  return (
    <SiteChrome>
      <NotFoundPage />
    </SiteChrome>
  );
}
