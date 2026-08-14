import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { ORG_LD } from "@/config/contact";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { WORK_ITEMS, statsOf } from "@/components/work/work.data";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — page Réalisations.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/realisations.tsx
 * ============================================================
 *
 * CE QUI ETAIT EN LIGNE, ET QUI A ETE SUPPRIME
 *
 * Quatre etudes de cas entierement inventees : Nordhaus, Meridian,
 * Atelier Vaste, Kairos Capital. Aucune de ces entreprises n'existe.
 * Leurs resultats non plus : +214 % de pipeline, cout par demonstration
 * divise par 2,8, 11 projets signes, 38 % de temps commercial libere.
 *
 * Plus bas, trois compteurs animes : 47 marques accompagnees, 12 M€ de
 * chiffre d'affaires genere, 93 % de clients reconduits.
 *
 * C'est la page la plus dangereuse du site telle qu'elle etait ecrite.
 * Un prospect qui cherche « Nordhaus » ou « Kairos Capital » ne trouve
 * rien, et il ne revient pas. Un concurrent qui la lit sait exactement
 * quoi dire de vous. Et publier des resultats chiffres invente est une
 * pratique commerciale trompeuse.
 *
 * CE QUI LES REMPLACE
 *
 * Les quatre realisations reelles, celles qui vivent deja dans
 * work.data.ts et qui s'affichent sur la page d'accueil. Meme source,
 * donc jamais de divergence : ajouter une realisation dans work.data.ts
 * l'ajoute ici automatiquement.
 *
 * Quatre projets vrais valent mieux que quatre projets inventes, meme
 * si le chiffre parait maigre. Un prospect ne compte pas les cas : il
 * en lit un, et il regarde si c'est credible.
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

export const Route = createFileRoute("/realisations")({
  component: Realisations,
  head: () => ({
    meta: [
      { title: "Réalisations — Campagnes et films de marque | ULTRA VISION" },
      {
        name: "description",
        content:
          "Campagnes publicitaires, films de marque et contenus verticaux produits en interne, de l'écriture au montage final.",
      },
      { property: "og:title", content: "Réalisations — ULTRA VISION" },
      {
        property: "og:description",
        content: "Ce que nous avons produit, et ce que ça a donné.",
      },
      { property: "og:url", content: `${URL}/realisations` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${URL}/realisations` }],
    scripts: [
      {
        /*
          CollectionPage listant les realisations reelles. Les chiffres
          declares sont ceux de work.data.ts : ils ne peuvent donc pas
          diverger de ce qui est affiche. Un resultat balise different
          du resultat affiche serait traite comme une manipulation.
        */
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${URL}/realisations`,
          inLanguage: "fr-FR",
          publisher: ORG_LD(URL),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: WORK_ITEMS.length,
            itemListElement: WORK_ITEMS.map((w, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "VideoObject",
                name: w.title,
                description: w.description,
                genre: w.category,
                thumbnailUrl: `${URL}${w.poster}`,
                contentUrl: `${URL}${w.sources.mp4}`,
                uploadDate: w.year ? `${w.year}-01-01` : undefined,
                creator: { "@type": "Organization", name: "ULTRA VISION" },
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
            { "@type": "ListItem", position: 2, name: "Réalisations", item: `${URL}/realisations` },
          ],
        }),
      },
    ],
  }),
});

function Realisations() {
  return (
    <>
      <PageHero
        eyebrow="Réalisations"
        title="Ce que nous avons produit, et ce que ça a donné."
        accent="et ce que ça a donné"
        intro="Tout est tourné et monté en interne, de l'écriture de l'angle au montage final. Les chiffres affichés sont ceux relevés dans les gestionnaires de publicités."
      />

      <section className="rule bg-background">
        <div className="shell py-14 lg:py-20">
          <div className="grid gap-5">
            {WORK_ITEMS.map((item, i) => {
              const stats = statsOf(item);
              /* Alternance du cote de l'image : la page cesse d'etre une
                 pile de blocs identiques et devient une lecture. */
              const flip = i % 2 === 1;

              return (
                <Reveal key={item.slug} delay={i * MOTION.stagger}>
                  <article
                    className="group grid gap-8 overflow-hidden rounded-3xl p-6 sm:p-8 lg:grid-cols-[280px_1fr] lg:gap-12 lg:p-10"
                    style={{
                      backgroundColor: "#0B1020",
                      border: "1px solid #16203a",
                      transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, transform ${MOTION.respond}ms ${EASE_RESPOND}`,
                    }}
                  >
                    {/* ---- L'affiche, en 9/16 strict ---- */}
                    <div
                      className="relative aspect-[9/16] overflow-hidden rounded-2xl"
                      style={{
                        order: flip ? 2 : 0,
                        backgroundColor: "#070A14",
                        boxShadow:
                          "inset 0 1px 0 rgba(191,219,254,.28), 0 22px 48px -18px rgba(0,0,0,.9)",
                      }}
                    >
                      <picture>
                        <source
                          srcSet={item.poster.replace(/poster\.jpg$/, "poster-sm.webp")}
                          media="(max-width: 640px)"
                          type="image/webp"
                        />
                        <source
                          srcSet={item.poster.replace(/poster\.jpg$/, "poster.webp")}
                          type="image/webp"
                        />
                        <img
                          src={item.poster}
                          alt=""
                          aria-hidden="true"
                          width={760}
                          height={1351}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ transition: `transform 900ms ${EASE_RESPOND}` }}
                        />
                      </picture>

                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(11,16,32,.8) 2%, transparent 46%)",
                        }}
                      />
                      <span className="absolute top-4 left-4 text-[0.66rem] tracking-[0.16em] text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* ---- Le texte ---- */}
                    <div className="min-w-0 lg:self-center">
                      <p className="text-[0.64rem] font-medium tracking-[0.16em] uppercase text-accent-hover">
                        {item.category}
                      </p>

                      <h2 className="display mt-3 text-3xl sm:text-4xl">{item.title}</h2>

                      <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#8792ad]">
                        {item.description}
                      </p>

                      {/* ---- Les chiffres ---- */}
                      <div className="mt-8 grid gap-6 border-t border-[#16203a] pt-7 sm:grid-cols-3">
                        {stats.map((s) => (
                          <div key={s.label}>
                            <p className="display text-3xl">{s.value}</p>
                            <p className="mt-2 text-[0.66rem] tracking-[0.14em] uppercase text-[#6d7a99]">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {item.year && (
                        <p className="mt-7 text-[0.72rem] text-[#5c6a86]">{item.year}</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Ce qui arrive ---------------- */}
      <section className="rule bg-surface">
        <div className="shell grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
          <Reveal>
            <div>
              <p className="eyebrow" style={{ color: "#60A5FA" }}>
                En production
              </p>
              <h2 className="display mt-5 text-3xl sm:text-4xl">
                Cinq autres films sont en cours de montage.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Nous préférons publier peu et publier vrai. Les prochaines réalisations
                arriveront ici au fur et à mesure de leur livraison.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="rounded-3xl p-7"
              style={{
                background:
                  "radial-gradient(120% 130% at 14% 0%, #1E3A8A 0%, #0B1226 48%, #0A0A0A 84%)",
                border: "1px solid #1c2946",
              }}
            >
              <p className="text-sm leading-relaxed text-[#cddafc]">
                Vous voulez voir un format proche du vôtre avant de décider ? Demandez-nous, nous
                vous enverrons les rushes correspondants.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-xs font-medium tracking-[0.12em] uppercase text-background"
                style={{ transition: `background-color ${MOTION.respond}ms ${EASE_RESPOND}` }}
              >
                Demander des exemples
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
