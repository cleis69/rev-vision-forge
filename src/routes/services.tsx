import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { AREA_SERVED, ORG_LD } from "@/config/contact";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { PACKS, euro, withOffer, LAUNCH_OFFER } from "@/config/pricing";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — page Services.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/services.tsx
 * ============================================================
 *
 * DEUX CORRECTIONS DE FOND
 *
 * 1. LES PRIX ETAIENT FAUX ET CONTREDISAIENT LA PAGE TARIFS.
 *    La page annoncait trois formats — Sprint a partir de 20 000 €,
 *    Programme a partir de 8 000 € par mois, Partenariat sur mesure.
 *    La grille reelle demarre a 490 €. Un visiteur qui lisait les deux
 *    pages ne savait plus laquelle croire, et dans le doute il partait.
 *
 *    Les formules affichees ici viennent maintenant de
 *    src/config/pricing.ts, exactement comme sur /tarifs. Une seule
 *    source, donc plus aucune divergence possible.
 *
 * 2. IL Y AVAIT CINQ POLES, IL Y EN A QUATRE.
 *    Branding et Creation de contenu ont ete reunis sous « Marque &
 *    Contenu » sur la page d'accueil. Les laisser separes ici donnait
 *    l'impression de deux sites cousus ensemble.
 *
 * L'ORDRE DES POLES A AUSSI CHANGE
 *
 * La production audiovisuelle passe en premier. C'est le metier de
 * base, celui qui amene les clients, et celui que le sous-titre de la
 * page d'accueil annonce. Le mettre en cinquieme position revenait a
 * cacher ce qu'on sait le mieux faire.
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

const POLES = [
  {
    n: "01",
    title: "Production publicitaire",
    intro:
      "Notre métier de base. Des vidéos pensées pour le feed, écrites autour d'un angle de vente, pas d'une belle image.",
    items: [
      "Recherche de l'angle et écriture du script",
      "Tournage, direction artistique, figuration",
      "Montage, sous-titres, habillage",
      "Formats verticaux Reels, Stories et Ads",
      "Déclinaisons pour tester plusieurs angles",
    ],
  },
  {
    n: "02",
    title: "Acquisition & diffusion",
    intro:
      "Une vidéo qui ne tourne pas ne vend rien. Nous pilotons la diffusion et le coût par résultat.",
    items: [
      "Meta Ads, Google Ads, TikTok Ads",
      "Structuration des comptes, pixels et conversions",
      "Tests créatifs et arbitrage des budgets",
      "Suivi du coût par lead et par rendez-vous",
      "Rapport mensuel commenté",
    ],
  },
  {
    n: "03",
    title: "Marque & contenu",
    intro:
      "Une identité n'existe pas sur une charte. Elle existe dans ce qui la fait circuler.",
    items: [
      "Positionnement et messages clés",
      "Identité visuelle et logotype",
      "Direction artistique",
      "Production photo",
      "Motion design",
    ],
  },
  {
    n: "04",
    title: "Web & automatisation",
    intro:
      "Ce qui reçoit le trafic et ce qui empêche un lead de se perdre entre le clic et l'appel.",
    items: [
      "Landing pages de conversion",
      "Sites vitrines rapides et sobres",
      "Mise en place ou connexion du CRM",
      "Automatisation des leads et des relances",
      "Suivi, tracking et tableaux de bord",
    ],
  },
];

/* Declare avant la route : POLES est lu par `head()` pour generer
   les donnees structurees, et par le composant pour l'affichage. */
export const Route = createFileRoute("/services")({
  component: Services,
  head: () => ({
    meta: [
      { title: "Services — Production publicitaire & acquisition | ULTRA VISION" },
      {
        name: "description",
        content:
          "Production de vidéos publicitaires, diffusion Meta / Google / TikTok, sites et landing pages, automatisation des leads. Quatre pôles, une seule équipe.",
      },
      { property: "og:title", content: "Services — ULTRA VISION" },
      {
        property: "og:description",
        content:
          "Production publicitaire, acquisition, web et automatisation, par la même équipe.",
      },
      { property: "og:url", content: `${URL}/services` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${URL}/services` }],
    scripts: [
      {
        /*
          Un Service par pole, dans un ItemList. C'est ce decoupage qui
          permet a un assistant interroge sur « qui fait du media buying
          a Casablanca » de trouver une correspondance precise, plutot
          qu'une page generique ou le mot apparait quelque part.
        */
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${URL}/services`,
          inLanguage: "fr-FR",
          publisher: ORG_LD(URL),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: POLES.length,
            itemListElement: POLES.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: p.title,
                description: p.intro,
                serviceType: p.items.join(", "),
                areaServed: AREA_SERVED,
                provider: { "@type": "Organization", name: "ULTRA VISION", url: URL },
              },
            })),
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: URL },
            { "@type": "ListItem", position: 2, name: "Services", item: `${URL}/services` },
          ],
        }),
      },
    ],
  }),
});


function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Nous produisons les vidéos, et nous les faisons tourner."
        accent="et nous les faisons tourner"
        intro="Quatre pôles, une seule équipe. La création et la diffusion sont faites par les mêmes personnes — c'est ce qui permet de corriger une campagne en changeant la vidéo, et non en changeant d'agence."
      />

      {/* ---------------- Les quatre poles ---------------- */}
      <section className="rule bg-background">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-4 lg:grid-cols-2">
            {POLES.map((p, i) => (
              <Reveal key={p.title} delay={i * MOTION.stagger} className="h-full">
                <article
                  tabIndex={0}
                  className="group relative h-full overflow-hidden rounded-3xl p-7 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-9"
                  style={{
                    backgroundColor: "#0B1020",
                    border: "1px solid #16203a",
                    transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, transform ${MOTION.respond}ms ${EASE_RESPOND}`,
                  }}
                >
                  {/*
                    Lueur bleue qui monte du bas au survol. Une couche
                    superposee dont on anime l'opacite : animer la
                    couleur de fond ferait passer la transition par des
                    gris sales a mi-parcours.
                  */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 50% 130%, rgba(37,99,235,.34) 0%, transparent 68%)",
                    }}
                  />

                  <div className="relative">
                    <span className="text-[0.68rem] tracking-[0.2em] text-accent">{p.n}</span>

                    <h2 className="display mt-5 text-2xl sm:text-3xl">{p.title}</h2>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-[#8792ad]">
                      {p.intro}
                    </p>

                    <ul className="mt-7 space-y-0 text-sm">
                      {p.items.map((it) => (
                        <li
                          key={it}
                          className="flex gap-3 border-t border-[#16203a] py-3 text-[#9aa7c2]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: "#3B82F6" }}
                          />
                          <span className="leading-relaxed">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Les formules, tirees de pricing.ts ---------------- */}
      <section className="rule bg-surface">
        <div className="shell py-16 lg:py-24">
          <Reveal>
            <p className="eyebrow" style={{ color: "#60A5FA" }}>
              Formules
            </p>
            <h2 className="display mt-5 max-w-2xl text-3xl sm:text-4xl">
              Trois façons de travailler ensemble.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Le détail complet, les prestations à l&apos;unité et ce qui n&apos;est jamais
              compris se trouvent sur la page tarifs.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PACKS.map((t, i) => {
              const now = t.noOffer ? t.price : withOffer(t.price);
              const reduced = LAUNCH_OFFER.enabled && now !== t.price;

              return (
                <Reveal key={t.id} delay={i * MOTION.stagger} className="h-full">
                  <div
                    className="flex h-full flex-col justify-between rounded-3xl p-7"
                    style={{
                      backgroundColor: t.featured ? "#0B1020" : "#0E0E0E",
                      border: t.featured ? "2px solid #2563EB" : "1px solid #262626",
                    }}
                  >
                    <div>
                      <h3 className="display text-2xl">{t.name}</h3>

                      <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="display text-[1.9rem] leading-none">{euro(now)}</span>
                        {t.period && (
                          <span className="text-sm text-muted-foreground">{t.period}</span>
                        )}
                        {reduced && (
                          <span
                            className="text-[0.8rem] text-[#5c5c5a]"
                            style={{ textDecoration: "line-through" }}
                          >
                            {euro(t.price)}
                          </span>
                        )}
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                        {t.forWho}
                      </p>

                      <p className="mt-4 text-[0.72rem] tracking-[0.1em] uppercase text-[#6d7a99]">
                        {t.commitment}
                      </p>
                    </div>

                    <Link
                      to="/tarifs"
                      className="link-underline mt-9 text-sm text-accent-hover"
                    >
                      Voir le détail
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={200}>
            <div className="mt-10">
              <Link
                to="/tarifs"
                className="group inline-flex items-center gap-3 text-[0.78rem] font-semibold tracking-[0.14em] uppercase text-foreground transition-colors duration-200 hover:text-accent-hover"
              >
                Voir tous les tarifs
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
