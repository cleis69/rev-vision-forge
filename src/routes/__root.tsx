import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageTransition } from "../components/PageTransition";
import { WhatsAppRail } from "../components/WhatsAppRail";
import { CONTACT } from "../config/contact";
import { SITE_URL } from "../config/site";

/**
 * ULTRA VISION — racine de l'application.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/__root.tsx
 * ============================================================
 *
 * TROIS CHANGEMENTS, RIEN D'AUTRE
 *
 * 1. <PageTransition> enveloppe <Outlet />. La transition retenue —
 *    la profondeur — fait reculer la page sortante et avancer la page
 *    entrante : elle doit donc envelopper le contenu, et non etre
 *    posee a cote comme l'ancien voile a iris.
 *
 *    Elle vit a la racine, jamais dans une page : placee dans une page,
 *    elle disparaitrait au moment meme ou cette page se demonte.
 *
 * 2. Le favicon pointe vers /favicon.svg. Un SVG reste net sur les
 *    ecrans a haute densite, la ou le PNG de 32 px bavait. Le PNG est
 *    conserve en second pour les navigateurs anciens.
 *
 * 3. Les donnees structurees affichaient studio@ultravision.fr et
 *    +33600000000, deux coordonnees inventees. Elles viennent
 *    maintenant du fichier de configuration. Google lit ces donnees et
 *    peut les afficher dans ses resultats : une adresse fausse a cet
 *    endroit se propage.
 *
 * Le reste du fichier est inchange.
 */

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-background transition-colors hover:bg-accent-hover"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Cette page n'a pas pu se charger
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un incident est survenu de notre côté. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-background transition-colors hover:bg-accent-hover"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-hairline px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-foreground transition-colors hover:border-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "ULTRA VISION" },
      { name: "theme-color", content: "#090909" },
      { property: "og:site_name", content: "ULTRA VISION" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      { rel: "preconnect", href: "https://cdn.fontshare.com", crossOrigin: "anonymous" },
      /*
        POLICES — huit fichiers reduits a QUATRE.

        Mise a jour du 15 aout 2026 : General Sans 700 a ete retiree.
        Verification faite sur tout le code, `font-bold` n'apparait
        nulle part — la graisse etait telechargee, decodee et gardee en
        memoire sans qu'aucun texte ne l'utilise.

        Sur mobile, chaque fichier de police en moins avance d'autant
        le moment ou le texte s'affiche : une feuille de style de
        police bloque le rendu tant qu'elle n'est pas lue.

        Detail de l'ancien commentaire ci-dessous.

        General Sans chargeait 400, 500, 600 et 700 ; Inter chargeait
        300, 400, 500 et 600. Huit fichiers, alors que le code n'en
        utilise que cinq :

          General Sans 500 et 700  -> les titres, classe `display`
          Inter 400, 500 et 600    -> corps, navigation, boutons

        Verifie en listant les classes reellement presentes dans le
        code : `font-medium` (500) apparait 26 fois, `font-semibold`
        (600) 7 fois. Inter 300 et General Sans 400 et 600 n'etaient
        appelees nulle part.

        Chaque graisse inutile est un fichier telecharge, decode et
        conserve en memoire pour rien — et une feuille de style de
        police bloque l'affichage du texte tant qu'elle n'est pas lue.
      */
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f%5B%5D=general-sans@500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    /*
      ==================================================================
       FEUILLE DE PERFORMANCE — mobile en priorite
      ==================================================================

      Ces regles ne changent rien a l'apparence sur ordinateur. Elles
      retirent, sur petit ecran, trois choses qui coutent cher a
      afficher et qui n'apportent presque rien a cette taille.
    */
    styles: [
      {
        children: `
/* ------------------------------------------------------------------
   1. LE FLOU D'ARRIERE-PLAN EST DESACTIVE SOUS 1024 px

   « backdrop-filter » oblige le telephone a lire ce qui se trouve
   derriere l'element, a le flouter, puis a le redessiner — a chaque
   image, et pour chaque element concerne. Le site en compte onze.

   Sur un ordinateur c'est gratuit. Sur un telephone d'entree de gamme
   c'est la premiere cause de saccade au defilement.

   On garde donc la couleur de fond, qui suffit a la lisibilite, et on
   retire uniquement le flou.
------------------------------------------------------------------ */
@media (max-width: 1023px) {
  [style*="backdrop-filter"],
  [style*="backdropFilter"],
  .backdrop-blur-sm,
  .backdrop-blur,
  .backdrop-blur-md,
  .backdrop-blur-lg,
  .backdrop-blur-xl {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

/* ------------------------------------------------------------------
   2. LES SECTIONS HORS ECRAN NE SONT PAS CALCULEES

   « content-visibility: auto » dit au navigateur de ne pas mettre en
   page ni peindre une section tant qu'elle n'approche pas de l'ecran.
   Sur une page de dix mille pixels, c'est le gain le plus important
   qu'on puisse obtenir sans rien retirer.

   « contain-intrinsic-size » donne une hauteur estimee a la section
   ignoree. Sans elle, la barre de defilement sauterait a mesure que
   les sections se calculent — un defaut pire que le probleme resolu.

   La premiere section de chaque page est exclue : elle est visible
   d'emblee, et l'ignorer retarderait au contraire l'affichage.
------------------------------------------------------------------ */
main section:not(:first-of-type) {
  content-visibility: auto;
  contain-intrinsic-size: auto 720px;
}

/* ------------------------------------------------------------------
   3. LA POLICE DE SECOURS EST AJUSTEE AUX VRAIES

   Pendant le chargement, le texte s'affiche dans la police du
   systeme. Quand la vraie arrive, les lettres changent de largeur et
   la mise en page saute — c'est le decalage que Google mesure et
   sanctionne.

   Ces deux polices de secours reprennent les proportions d'Inter et
   de General Sans. L'echange devient invisible.
------------------------------------------------------------------ */
@font-face {
  font-family: "Inter-fallback";
  src: local("Helvetica Neue"), local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
@font-face {
  font-family: "GeneralSans-fallback";
  src: local("Helvetica Neue"), local("Arial");
  size-adjust: 103%;
  ascent-override: 96%;
  descent-override: 24%;
  line-gap-override: 0%;
}

/* ------------------------------------------------------------------
   4. RIEN NE BOUGE POUR QUI A DEMANDE MOINS D'ANIMATIONS

   Regle de securite globale. Chaque composant la respecte deja, mais
   une regle unique garantit qu'un oubli futur ne passera pas.
------------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
        `,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ULTRA VISION",
          alternateName: "Ultra Vision — Creative Growth Agency",
          url: SITE_URL,
          email: CONTACT.email,
          ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
          sameAs: [],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      {/*
        <PageTransition> ENVELOPPE desormais le contenu au lieu d'etre
        pose a cote. C'est necessaire : la transition retenue fait
        reculer puis avancer la page elle-meme, il faut donc qu'elle
        ait prise sur l'element qui contient la page.

        La barre de navigation reste volontairement en dehors. Elle ne
        change pas d'une page a l'autre : la faire reculer avec le
        contenu donnerait l'impression que tout le site clignote, au
        lieu de suggerer qu'une page passe derriere une autre.
      */}
      <main>
        <PageTransition>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </PageTransition>
      </main>
      <SiteFooter />

      {/*
        L'appel WhatsApp permanent, sur le bord droit. Monte a la racine
        et non dans une page : il doit survivre aux changements de page,
        sinon il disparaitrait puis reapparaitrait a chaque navigation.

        Il est aussi place APRES <PageTransition> a dessein — il ne doit
        pas reculer et se flouter avec le contenu : c'est un element de
        chrome, pas de page.
      */}
      <WhatsAppRail />
    </QueryClientProvider>
  );
}
