import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { MaskReveal, Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import { AREA_SERVED, CONTACT, hasWhatsapp, whatsappUrl } from "@/config/contact";
import { EASE_RESPOND, MOTION } from "@/config/motion";
import {
  A_LA_CARTE,
  CUSTOM,
  LAUNCH_OFFER,
  MAD,
  NOT_INCLUDED,
  PACKS,
  dirham,
  euro,
  withOffer,
} from "@/config/pricing";

/**
 * ULTRA VISION — page Tarifs.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/routes/tarifs.tsx
 *  Accessible a l'adresse /tarifs
 * ============================================================
 *
 * TOUS LES MONTANTS VIENNENT DE src/config/pricing.ts.
 * Cette page ne contient aucun chiffre en dur : changer un prix se
 * fait dans le fichier de configuration, jamais ici.
 *
 * L'ARGUMENT DE LA PAGE
 *
 * Ce n'est pas « nos prix sont bas ». C'est « vous savez ce que vous
 * payez ». Sur ce marche, l'inquietude du prospect n'est presque
 * jamais le montant : c'est de decouvrir en cours de route qu'il
 * manquait une ligne.
 *
 * D'ou trois partis pris qui structurent toute la page :
 *
 * 1. LA SECTION « CE QUI N'EST JAMAIS COMPRIS » EST MISE EN AVANT, et
 *    non reléguee en note de bas de page. Le budget publicitaire, les
 *    intervenants externes, les abonnements : tout est dit avant la
 *    signature. C'est la section la plus rentable de la page, parce
 *    que c'est celle qui evite les ruptures au deuxieme mois.
 *
 * 2. LE DETAIL A L'UNITE EST PUBLIE SOUS LES FORMULES. Un pack dont on
 *    ne peut pas recomposer le calcul est une boite noire. Publier le
 *    prix unitaire prouve que la remise de volume est reelle.
 *
 * 3. LE « SUR DEVIS » ARRIVE EN DERNIER, avec un delai annonce. Un
 *    « nous consulter » sans engagement de delai est lu comme un
 *    refus de repondre.
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

/*
  Declaree AVANT la route, et non plus en bas du fichier.

  Ces questions servent maintenant deux fois : a l'affichage, et dans
  les donnees structurees FAQPage generees dans `head()`. Les garder
  plus bas fonctionnerait — `head()` n'est appele qu'au rendu — mais
  une constante lue par une fonction ecrite trois cents lignes plus
  haut est exactement le genre de dependance qu'on casse sans s'en
  rendre compte en reorganisant un fichier.
*/
const FAQ_TARIFS = [
  {
    q: "Le budget publicitaire est-il compris ?",
    a: "Non, jamais. Il est versé directement aux plateformes depuis votre compte, ce qui vous en laisse la pleine propriété. Comptez 800 € à 1 500 € par mois pour démarrer selon votre secteur.",
  },
  {
    q: "Que se passe-t-il après les 3 mois d'engagement ?",
    a: "L'accompagnement continue au mois, résiliable avec un préavis de 30 jours. Il n'y a pas de reconduction longue automatique.",
  },
  {
    q: "Les prix peuvent-ils changer en cours de mission ?",
    a: "Non. Le prix validé au devis est ferme pour toute la durée de la mission. Une prestation ajoutée en cours de route fait l'objet d'un avenant chiffré à part, accepté avant d'être exécuté.",
  },
  {
    q: "À qui appartiennent les vidéos et les comptes ?",
    a: "À vous. Fichiers sources livrés, comptes publicitaires ouverts à votre nom, accès administrateur complet. Si nous arrêtons de travailler ensemble, vous repartez avec tout.",
  },
  {
    q: "Comment se passe le règlement ?",
    a: "Les formules mensuelles sont réglées en début de mois. Les prestations à l'unité, 50 % à la commande et 50 % à la livraison.",
  },
];

export const Route = createFileRoute("/tarifs")({
  component: Tarifs,
  head: () => ({
    meta: [
      { title: "Tarifs — ULTRA VISION" },
      {
        name: "description",
        content:
          "Production de vidéos publicitaires et acquisition. Prix affichés, périmètre détaillé, aucune surprise. À partir de 490 € la vidéo, diffusion comprise.",
      },
      { property: "og:title", content: "Tarifs — ULTRA VISION" },
      {
        property: "og:description",
        content:
          "Des prix affichés, un périmètre détaillé, et la liste de ce qui n'est jamais compris.",
      },
      { property: "og:url", content: `${URL}/tarifs` },
    ],
    links: [{ rel: "canonical", href: `${URL}/tarifs` }],
    scripts: [
      {
        /*
          CATALOGUE D'OFFRES — le balisage le plus utile du site.

          « Combien coute une video publicitaire » est une question que
          les gens posent desormais autant a un assistant qu'a Google.
          Un assistant qui trouve un prix ecrit en clair dans les
          donnees structurees le cite ; un assistant qui doit le deviner
          en lisant une page cite quelqu'un d'autre.

          Les montants sont generes a partir de pricing.ts : ils ne
          peuvent pas diverger de ce qui est affiche a l'ecran. C'est
          essentiel — un prix balise different du prix affiche est
          traite comme une tentative de manipulation.
        */
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Production de vidéos publicitaires et acquisition",
          serviceType: "Publicité vidéo et media buying",
          provider: { "@type": "Organization", name: "ULTRA VISION", url: URL },
          areaServed: AREA_SERVED,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Formules ULTRA VISION",
            itemListElement: PACKS.map((p) => ({
              "@type": "Offer",
              name: p.name,
              description: p.forWho,
              price: p.price,
              priceCurrency: "EUR",
              /* Le prix est hors taxes : il faut le declarer, sinon il
                 est suppose TTC et devient faux. */
              priceSpecification: {
                "@type": "PriceSpecification",
                price: p.price,
                priceCurrency: "EUR",
                valueAddedTaxIncluded: false,
              },
              category: p.period ? "Abonnement mensuel" : "Prestation unique",
              url: `${URL}/tarifs`,
            })),
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_TARIFS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: URL },
            { "@type": "ListItem", position: 2, name: "Tarifs", item: `${URL}/tarifs` },
          ],
        }),
      },
    ],
  }),
});

/* ========================================================================== */

function Tarifs() {
  return (
    <>
      <Head />
      <Packs />
      <NotIncluded />
      <Carte />
      <Custom />
      <Faq />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Head() {
  return (
    <section className="relative overflow-hidden">
      <div className="shell pt-36 pb-12 lg:pt-40 lg:pb-14">
        <Reveal>
          <p className="eyebrow" style={{ color: "#3B82F6" }}>
            Tarifs
          </p>
        </Reveal>

        <h1 className="display mt-5 max-w-3xl text-[2.2rem] leading-[1.02] tracking-[-0.035em] sm:text-[3rem] lg:text-[3.6rem]">
          <MaskReveal delay={80}>Des prix affichés,</MaskReveal>
          <MaskReveal delay={165}>
            <span
              style={{
                background: "linear-gradient(96deg, #60A5FA 0%, #3B82F6 48%, #1D4ED8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              aucune surprise.
            </span>
          </MaskReveal>
        </h1>

        <Reveal delay={280}>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tout est écrit : ce qui est compris, ce qui ne l&apos;est pas, et le prix de chaque
            prestation prise séparément. Vous pouvez refaire le calcul vous-même.
          </p>
        </Reveal>

        <Reveal delay={340}>
          <p className="mt-4 text-sm text-[#5c5c5a]">
            Montants en euros hors taxes. Le budget publicitaire n&apos;est jamais inclus.
            {MAD.enabled && (
              <>
                {" "}
                Les équivalents en dirhams sont donnés {MAD.note}.
              </>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function OfferBadge({ className = "" }: { className?: string }) {
  if (!LAUNCH_OFFER.enabled) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-medium tracking-[0.1em] uppercase ${className}`}
      style={{
        backgroundColor: "rgba(59,130,246,.14)",
        border: "1px solid rgba(96,165,250,.4)",
        color: "#93C5FD",
      }}
    >
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full"
        style={{ backgroundColor: "#60A5FA" }}
      />
      {LAUNCH_OFFER.badge}
    </span>
  );
}

function Packs() {
  return (
    <section className="rule bg-background">
      <div className="shell py-16 lg:py-20">
        {LAUNCH_OFFER.enabled && (
          <Reveal>
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <OfferBadge />
              {LAUNCH_OFFER.until && (
                <span className="text-[0.74rem] text-[#5c5c5a]">{LAUNCH_OFFER.until}</span>
              )}
            </div>
          </Reveal>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {PACKS.map((p, i) => {
            const full = p.price;
            const now = p.noOffer ? p.price : withOffer(p.price);
            const reduced = LAUNCH_OFFER.enabled && now !== full;

            return (
              <Reveal key={p.id} delay={i * MOTION.stagger} className="h-full">
                <article
                  className="relative flex h-full flex-col rounded-3xl p-7 sm:p-8"
                  style={{
                    backgroundColor: p.featured ? "#0B1020" : "#0E0E0E",
                    /*
                      La formule recommandee est la seule a porter une
                      bordure bleue de 2 px. Toute autre difference —
                      taille, ombre portee, decalage vertical — casserait
                      l'alignement des trois colonnes et donnerait
                      l'impression d'un bug de mise en page.
                    */
                    border: p.featured ? "2px solid #2563EB" : "1px solid #262626",
                    boxShadow: p.featured
                      ? "0 30px 70px -30px rgba(37,99,235,.5), 0 0 0 1px rgba(59,130,246,.12)"
                      : "none",
                  }}
                >
                  {p.featured && (
                    <span
                      className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[0.6rem] font-medium tracking-[0.14em] uppercase"
                      style={{ backgroundColor: "#2563EB", color: "#fff" }}
                    >
                      Le plus choisi
                    </span>
                  )}

                  <h2 className="display text-2xl">{p.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.forWho}</p>

                  {/* --- Le prix --- */}
                  <div className="mt-7 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="display text-[2.6rem] leading-none tracking-[-0.03em]">
                      {euro(now)}
                    </span>
                    {p.period && (
                      <span className="text-sm text-muted-foreground">{p.period}</span>
                    )}
                    {reduced && (
                      <span
                        className="text-sm text-[#5c5c5a]"
                        style={{ textDecoration: "line-through" }}
                      >
                        {euro(full)}
                      </span>
                    )}
                  </div>
                  {reduced && (
                    <p className="mt-1.5 text-[0.72rem] text-[#93C5FD]">
                      Prix de la première commande. {euro(full)} ensuite.
                    </p>
                  )}

                  {/*
                    L'equivalent en dirhams, en petit sous le prix.
                    Neuf clients sur dix sont des expatries : ils
                    raisonnent en euros mais ils reglent en dirhams.
                    Repondre aux deux questions evite l'aller-retour
                    « et ca fait combien en vrai ? ».
                  */}
                  {MAD.enabled && (
                    <p className="mt-1.5 text-[0.76rem] text-[#6d7a99]">
                      ≈ {dirham(now)}
                      {p.period ? ` ${p.period}` : ""}
                    </p>
                  )}

                  {/*
                    LA DECOMPOSITION.

                    « 1 490 € par mois » se subit en bloc. « soit 372 €
                    la video » se compare a ce que le lecteur connait.
                    Un prix comparable parait toujours plus juste qu'un
                    prix global — et le visiteur peut verifier lui-meme
                    avec les tarifs unitaires publies plus bas.
                  */}
                  {p.equivalent && (
                    <p className="mt-2 text-[0.78rem] text-[#8792ad]">{p.equivalent}</p>
                  )}

                  {/*
                    L'ANCRAGE.

                    Le meme perimetre paye a l'unite. Chaque ligne du
                    calcul est publiee dans la section « a la carte » :
                    l'economie est verifiable, donc credible.
                  */}
                  {p.anchor && p.anchor > full && (
                    <p className="mt-3 text-[0.78rem] text-[#6d7a99]">
                      <span style={{ textDecoration: "line-through" }}>{euro(p.anchor)}</span> en
                      payant chaque prestation à l&apos;unité{" "}
                      <span className="text-[#93C5FD]">
                        — vous économisez {euro(p.anchor - full)}
                      </span>
                    </p>
                  )}

                  {/* --- Engagement et delai --- */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-3 py-1.5 text-[0.68rem] text-[#c8c8c6]"
                      style={{ border: "1px solid #262626" }}
                    >
                      {p.commitment}
                    </span>
                    {p.delay && (
                      <span
                        className="rounded-full px-3 py-1.5 text-[0.68rem] text-[#c8c8c6]"
                        style={{ border: "1px solid #262626" }}
                      >
                        {p.delay}
                      </span>
                    )}
                  </div>

                  {/* --- Le detail --- */}
                  <ul className="mt-7 space-y-3 border-t border-hairline pt-7 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3 text-[#c2c2c0]">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: p.featured ? "#60A5FA" : "#4a4a48" }}
                        />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                    {p.bonus && (
                      <li className="flex gap-3 font-medium" style={{ color: "#93C5FD" }}>
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: "#60A5FA" }}
                        />
                        <span className="leading-relaxed">{p.bonus}</span>
                      </li>
                    )}
                  </ul>

                  <div className="mt-8 pt-2">
                    <Magnetic strength={0.18} radius={80}>
                      <Link
                        to="/contact"
                        className="inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-xs font-medium tracking-[0.12em] uppercase"
                        style={{
                          backgroundColor: p.featured ? "#2563EB" : "#F5F5F3",
                          color: p.featured ? "#fff" : "#090909",
                          transition: `background-color ${MOTION.respond}ms ${EASE_RESPOND}`,
                        }}
                      >
                        {p.cta}
                      </Link>
                    </Magnetic>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function NotIncluded() {
  return (
    <section className="rule bg-surface">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20">
        <Reveal>
          <div>
            <p className="eyebrow">Transparence</p>
            <h2 className="display mt-5 text-3xl sm:text-4xl">
              Ce qui n&apos;est jamais compris.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Cette liste est là pour qu&apos;aucune ligne ne vous surprenne au deuxième mois.
              C&apos;est la partie de la page que nous vous conseillons de lire en premier.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-2 sm:grid-cols-2">
          {NOT_INCLUDED.map((n, i) => (
            <Reveal key={n.label} delay={i * MOTION.stagger}>
              <div
                className="h-full rounded-2xl p-5"
                style={{ backgroundColor: "#0E0E0E", border: "1px solid #262626" }}
              >
                <h3 className="text-[0.95rem] font-medium">{n.label}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {n.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Carte() {
  return (
    <section className="rule bg-background">
      <div className="shell py-16 lg:py-20">
        <Reveal>
          <p className="eyebrow">À la carte</p>
          <h2 className="display mt-5 max-w-2xl text-3xl sm:text-4xl">
            Le prix de chaque prestation, prise séparément.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Publié pour une raison simple : vous pouvez refaire le calcul et vérifier que la
            remise de volume des formules est réelle.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {A_LA_CARTE.map((g, gi) => (
            <Reveal key={g.group} delay={gi * MOTION.stagger}>
              <div>
                <p className="text-[0.68rem] font-medium tracking-[0.16em] uppercase text-accent">
                  {g.group}
                </p>

                <div className="mt-5 border-t border-hairline">
                  {g.items.map((it) => {
                    const now = withOffer(it.price);
                    const reduced = LAUNCH_OFFER.enabled && now !== it.price;

                    return (
                      <div
                        key={it.label}
                        className="group grid grid-cols-[1fr_auto] items-baseline gap-6 border-b border-hairline py-5 transition-colors"
                        style={{ transition: `background-color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                      >
                        <div className="min-w-0">
                          <h3 className="text-[0.95rem] font-medium">{it.label}</h3>
                          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
                            {it.detail}
                          </p>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          {it.from && (
                            <span className="mr-1 text-[0.7rem] text-muted-foreground">
                              à partir de
                            </span>
                          )}
                          <span className="display text-[1.25rem]">{euro(now)}</span>
                          {it.unit && (
                            <span className="ml-1 text-[0.72rem] text-muted-foreground">
                              {it.unit}
                            </span>
                          )}
                          {reduced && (
                            <p
                              className="mt-0.5 text-[0.72rem] text-[#5c5c5a]"
                              style={{ textDecoration: "line-through" }}
                            >
                              {euro(it.price)}
                            </p>
                          )}
                          {MAD.enabled && (
                            <p className="mt-0.5 text-[0.68rem] text-[#5c6a86]">
                              ≈ {dirham(now)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {LAUNCH_OFFER.enabled && (
          <Reveal delay={120}>
            <div className="mt-10">
              <OfferBadge />
              <p className="mt-3 text-[0.78rem] text-[#5c5c5a]">
                La remise s&apos;applique à votre première commande, formule ou prestation à
                l&apos;unité. {LAUNCH_OFFER.until}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Custom() {
  return (
    <section className="rule bg-background">
      <div className="shell py-16 lg:py-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{
              background:
                "radial-gradient(120% 130% at 12% 0%, #1E3A8A 0%, #0B1226 46%, #0A0A0A 82%)",
              border: "1px solid #1c2946",
            }}
          >
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <p className="eyebrow" style={{ color: "#93C5FD" }}>
                  Sur devis
                </p>
                <h2 className="display mt-5 max-w-lg text-3xl sm:text-4xl">{CUSTOM.title}</h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#a9bad8]">
                  {CUSTOM.text}
                </p>
              </div>

              <div>
                <ul className="space-y-3 text-sm">
                  {CUSTOM.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-[#cddafc]">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: "#60A5FA" }}
                      />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Magnetic strength={0.2} radius={90}>
                    <Link
                      to="/contact"
                      className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-xs font-medium tracking-[0.12em] uppercase text-background"
                      style={{ transition: `background-color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                    >
                      {CUSTOM.cta}
                    </Link>
                  </Magnetic>

                  {hasWhatsapp ? (
                    <a
                      href={whatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center rounded-full px-7 text-xs font-medium tracking-[0.12em] uppercase text-foreground"
                      style={{
                        border: "1px solid #2b4880",
                        transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}`,
                      }}
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="inline-flex h-12 items-center rounded-full px-7 text-xs font-medium tracking-[0.12em] uppercase text-foreground"
                      style={{ border: "1px solid #2b4880" }}
                    >
                      Nous écrire
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <section className="rule bg-surface">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20">
        <Reveal>
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-5 text-3xl sm:text-4xl">Avant de vous décider.</h2>
          </div>
        </Reveal>

        <div className="border-t border-hairline">
          {FAQ_TARIFS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <div className="border-b border-hairline py-6">
                <h3 className="text-[0.98rem] font-medium">{f.q}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
