import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { TeamCard, type Member } from "@/components/TeamAvatar";
import { CONTACT, ORG_LD } from "@/config/contact";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — page À propos.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/a-propos.tsx
 * ============================================================
 *
 * CE QUI A ETE SUPPRIME, ET POURQUOI
 *
 * L'ancienne version annoncait « dix-huit specialistes » repartis en
 * six poles chiffres — 3 directeurs artistiques, 4 developpeurs, etc.
 * Ces nombres etaient inventes. Sur une page « A propos », c'est le
 * mensonge le plus facile a verifier : il suffit d'un appel ou d'un
 * coup d'oeil a LinkedIn.
 *
 * Elle annoncait aussi des bureaux a « Paris — Dubai — Casablanca ».
 * Deux de ces trois villes n'existent pas dans l'entreprise.
 *
 * CE QUI LES REMPLACE
 *
 * Quatre personnes reelles, nommees, avec leur parcours. Une equipe de
 * quatre dont on peut citer les noms vaut infiniment mieux qu'une
 * equipe de dix-huit anonymes — parce qu'elle est verifiable, et parce
 * qu'un client achete des personnes, pas un organigramme.
 *
 * ------------------------------------------------------------
 *  DEUX CHOSES A COMPLETER DE TON COTE
 *
 *  1. LE PRENOM DE LA COMMUNITY MANAGER. Il n'a pas ete communique.
 *     Le champ contient « Prenom » et un avertissement s'affiche dans
 *     la console du navigateur tant qu'il n'est pas rempli.
 *
 *  2. LES PHOTOS. Depose-les dans public/brand/team/ puis renseigne le
 *     champ `photo` de chaque membre, par exemple '/brand/team/cleis.jpg'.
 *     Format conseille : 640 x 800 px, cadrage vertical.
 *     Tant que le champ est vide, l'avatar dessine prend le relais —
 *     et si un nom de fichier est faux, l'avatar revient tout seul.
 * ------------------------------------------------------------
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

/* ==========================================================================
 *  L'EQUIPE
 * ========================================================================== */

/** Marqueur du prenom manquant. Ne pas renommer : il sert au controle. */
const NAME_TODO = "Prénom";

const TEAM: Member[] = [
  {
    name: "Cleis Padou",
    role: "Fondateur",
    bio: "Dix ans à la tête d'un studio de production audiovisuelle en France. Formé en école de commerce, autodidacte pour le reste. C'est lui qui prend le brief, et c'est lui qui reste sur le projet.",
    facts: ["Business school", "Autodidacte", "10 ans de studio en France"],
    // photo: '/brand/team/cleis.jpg',
  },
  {
    name: "Julien",
    role: "Directeur artistique",
    bio: "Photographe et vidéaste depuis plus de dix ans, architecte d'intérieur de formation. Ce double regard explique la façon dont il compose un cadre : il pense l'espace avant de penser l'image.",
    facts: ["Photo & vidéo", "Architecte d'intérieur", "10 ans d'expérience"],
    // photo: '/brand/team/julien.jpg',
  },
  {
    name: NAME_TODO,
    role: "Community manager",
    bio: "Elle tient la ligne éditoriale et la présence quotidienne sur les réseaux : ce qui se publie, quand, et sur quel ton. C'est le lien entre les campagnes payantes et ce que la marque raconte le reste du temps.",
    facts: ["Ligne éditoriale", "Réseaux sociaux", "Community management"],
  },
  {
    name: "Selim",
    role: "Media buyer",
    bio: "Il pilote la diffusion sur Meta, Google et TikTok : structure des campagnes, arbitrage des budgets, coût par résultat. C'est lui qui transforme une bonne vidéo en rendez-vous qualifiés.",
    facts: ["Meta Ads", "Google Ads", "TikTok Ads"],
  },
];

/*
  Avertissement en console tant que le prenom manque. Il s'affiche pour
  toi en developpement, jamais pour un visiteur. C'est le meme
  garde-fou que pour les statistiques : une donnee manquante doit se
  signaler, pas se faire oublier.
*/
if (typeof window !== "undefined" && TEAM.some((m) => m.name === NAME_TODO)) {
  console.warn(
    "[ULTRA VISION] Le prénom de la community manager n'est pas renseigné. " +
      "À compléter dans src/routes/a-propos.tsx, tableau TEAM.",
  );
}

/*
  L'EQUIPE EST DECLAREE AVANT LA ROUTE.

  Elle sert maintenant deux fois : a l'affichage, et dans les
  donnees structurees generees par `head()`. Une constante lue par
  une fonction ecrite cent lignes plus haut est exactement le genre
  de dependance qu'on casse sans s'en apercevoir en reorganisant
  un fichier.
*/
export const Route = createFileRoute("/a-propos")({
  component: APropos,
  head: () => ({
    meta: [
      { title: "À propos — L'équipe ULTRA VISION" },
      {
        name: "description",
        content:
          "Une équipe restreinte de seniors : production audiovisuelle, direction artistique, contenu et media buying. Nous intervenons à Casablanca, Rabat, Marrakech, Tanger et Agadir.",
      },
      { property: "og:title", content: "À propos — ULTRA VISION" },
      {
        property: "og:description",
        content:
          "Quatre spécialistes, nommés. Ceux qui vous vendent le projet sont ceux qui l'exécutent.",
      },
      { property: "og:url", content: `${URL}/a-propos` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${URL}/a-propos` }],
    scripts: [
      {
        /*
          AboutPage + Organization avec ses membres.

          Nommer les personnes dans les donnees structurees sert deux
          choses : Google associe l'entreprise a des individus reels,
          ce qui compte dans son evaluation de fiabilite ; et un
          assistant interroge sur « qui dirige ULTRA VISION » trouve
          une reponse attribuable au lieu de deviner.

          On ne declare que les noms et les fonctions — jamais de
          coordonnees personnelles.
        */
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${URL}/a-propos`,
          inLanguage: "fr-FR",
          mainEntity: {
            ...ORG_LD(URL),
            foundingLocation: { "@type": "Place", name: "Maroc" },
            numberOfEmployees: { "@type": "QuantitativeValue", value: 4 },
            employee: TEAM.filter((m) => m.name !== NAME_TODO).map((m) => ({
              "@type": "Person",
              name: m.name,
              jobTitle: m.role,
              worksFor: { "@type": "Organization", name: "ULTRA VISION" },
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
            { "@type": "ListItem", position: 2, name: "À propos", item: `${URL}/a-propos` },
          ],
        }),
      },
    ],
  }),
});

/* ==========================================================================
 *  VALEURS
 * ========================================================================== */

const VALUES = [
  {
    t: "Ceux qui vendent exécutent",
    d: "Vous parlez aux personnes qui travailleront sur votre projet. Il n'y a pas de seconde équipe derrière la première.",
  },
  {
    t: "Des humains, outillés",
    d: "L'intelligence artificielle nous fait gagner du temps sur la préparation et le montage. Elle n'écrit pas nos angles et ne tient pas la caméra.",
  },
  {
    t: "Des périmètres écrits",
    d: "Ce qui est compris, ce qui ne l'est pas, et le prix. Tout figure au devis, avant de commencer.",
  },
  {
    t: "Peu de clients à la fois",
    d: "Une équipe restreinte ne peut pas tout prendre. Nous préférons refuser une mission que la livrer à moitié.",
  },
];

/* ==========================================================================
 *  LA PAGE
 * ========================================================================== */

function APropos() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Une équipe restreinte, et vous savez qui fait quoi."
        accent="et vous savez qui fait quoi"
        intro="ULTRA VISION produit des contenus publicitaires et pilote leur diffusion. Nous intervenons uniquement au Maroc — Casablanca, Rabat, Marrakech, Tanger et Agadir — auprès de dirigeants francophones qui y ont installé leur activité."
      />

      {/* ---------------- Parti pris ---------------- */}
      <section className="rule bg-background">
        <div className="shell grid gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <Reveal>
            <div>
              <p className="eyebrow">Notre parti pris</p>
              <h2 className="display mt-5 text-3xl sm:text-4xl">
                Une belle vidéo qui ne vend rien reste une dépense.
              </h2>
              <p className="mt-7 text-base leading-relaxed text-muted-foreground">
                La plupart des entreprises n&apos;ont pas un problème de créativité. Elles ont un
                problème de chaîne : de belles images d&apos;un côté, des campagnes de
                l&apos;autre, et personne pour relier les deux.
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Nous produisons et nous diffusons. C&apos;est la même équipe, donc le même
                objectif — et personne à qui renvoyer la responsabilité quand les résultats ne
                viennent pas.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * MOTION.stagger} className="h-full">
                <div
                  tabIndex={0}
                  className="group h-full rounded-2xl p-5 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{
                    backgroundColor: "#0B1020",
                    border: "1px solid #16203a",
                    transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, background-color ${MOTION.respond}ms ${EASE_RESPOND}`,
                  }}
                >
                  <h3 className="text-[0.95rem] font-medium transition-colors duration-200 group-hover:text-[#93C5FD]">
                    {v.t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#8792ad]">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- L'equipe ---------------- */}
      <section className="rule relative overflow-hidden bg-surface">
        {/* Contre-jour bleu, le meme dispositif que le ruban des realisations. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 46% at 50% 42%, rgba(59,130,246,.16) 0%, transparent 70%)",
          }}
        />

        <div className="shell relative py-20 lg:py-28">
          <Reveal>
            <p className="eyebrow" style={{ color: "#60A5FA" }}>
              L&apos;équipe
            </p>
            <h2 className="display mt-5 max-w-2xl text-3xl sm:text-4xl lg:text-5xl">
              Quatre personnes. Vous les connaîtrez toutes.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Nous ne prétendons pas être une grande structure. C&apos;est précisément
              l&apos;intérêt : il n&apos;y a personne entre vous et ceux qui produisent.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <Reveal key={m.role} delay={i * MOTION.stagger} className="h-full">
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-12 text-sm text-muted-foreground">{CONTACT.locations}</p>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
