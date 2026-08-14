import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { ARTICLES_SORTED, formatDate } from "@/content/blog";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — la liste des articles.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/routes/blog.index.tsx
 *
 *  ATTENTION : ce fichier va DE PAIR avec src/routes/blog.tsx.
 *  Les deux sont necessaires, et ils ne font pas la meme chose.
 * ============================================================
 *
 * POURQUOI DEUX FICHIERS POUR UNE SEULE PAGE
 *
 * Des qu'une adresse a des adresses enfants — ici /blog et
 * /blog/mon-article — le routeur en fait un PARENT. Un parent ne
 * s'affiche pas a la place de son enfant : il l'entoure. Il doit donc
 * contenir un `<Outlet />`, l'emplacement ou l'enfant vient se poser.
 *
 * Le fichier blog.tsx precedent affichait la liste des articles et ne
 * contenait aucun Outlet. Resultat, en ouvrant un article : l'adresse
 * etait la bonne, le titre de l'onglet aussi, les donnees structurees
 * aussi — mais le corps de la page affichait la liste, parce que
 * l'article n'avait nulle part ou apparaitre.
 *
 * La separation resout cela proprement :
 *
 *   blog.tsx        -> le parent. Ne contient qu'un <Outlet />.
 *   blog.index.tsx  -> la page /blog elle-meme, c'est-a-dire ce fichier.
 *   blog.$slug.tsx  -> un article.
 *
 * Le suffixe `.index` designe precisement « l'adresse du parent, sans
 * rien apres ».
 *
 * Les articles viennent de src/content/blog.ts. Cette page ne contient
 * aucun texte d'article : ajouter un article la-bas l'ajoute ici.
 *
 * LES DONNEES STRUCTUREES
 *
 * La page se declare comme un `Blog` contenant une liste d'articles.
 * Cela permet a Google de comprendre qu'il s'agit d'un index et non
 * d'un article unique, et d'associer chaque titre a son adresse sans
 * avoir a explorer le site.
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

export const Route = createFileRoute("/blog/")({
  component: Blog,
  head: () => ({
    meta: [
      { title: "Blog — Publicité vidéo, acquisition et production | ULTRA VISION" },
      {
        name: "description",
        content:
          "Nos méthodes de production publicitaire et d'acquisition, expliquées sans jargon : tunnel TOFU MOFU BOFU, prix réels, format vertical, usage de l'IA.",
      },
      { property: "og:title", content: "Blog — ULTRA VISION" },
      {
        property: "og:description",
        content:
          "Comment nous produisons et diffusons des vidéos publicitaires. Méthodes, prix et arbitrages, expliqués en détail.",
      },
      { property: "og:url", content: `${URL}/blog` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${URL}/blog` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog ULTRA VISION",
          description:
            "Méthodes de production publicitaire et d'acquisition : tunnel de conversion, prix, formats, usage de l'intelligence artificielle.",
          url: `${URL}/blog`,
          inLanguage: "fr-FR",
          publisher: {
            "@type": "Organization",
            name: "ULTRA VISION",
            url: URL,
          },
          blogPost: ARTICLES_SORTED.map((a) => ({
            "@type": "BlogPosting",
            headline: a.title,
            description: a.excerpt,
            datePublished: a.date,
            url: `${URL}/blog/${a.slug}`,
            author: { "@type": "Organization", name: "ULTRA VISION" },
          })),
        }),
      },
    ],
  }),
});

function Blog() {
  const [lead, ...rest] = ARTICLES_SORTED;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Comment nous travaillons, expliqué en détail."
        accent="expliqué en détail"
        intro="Nos méthodes de production et de diffusion, sans jargon et sans zone grise. Chaque article répond à une question qu'un client nous a réellement posée."
      />

      <section className="rule bg-background">
        <div className="shell py-14 lg:py-20">
          {/* ---------------- L'article mis en avant ---------------- */}
          {lead && (
            <Reveal>
              <Link
                to="/blog/$slug"
                params={{ slug: lead.slug }}
                className="group block overflow-hidden rounded-3xl p-7 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-10"
                style={{
                  background:
                    "radial-gradient(120% 130% at 12% 0%, #1E3A8A 0%, #0B1226 46%, #0A0A0A 84%)",
                  border: "1px solid #1c2946",
                  transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}`,
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-[0.62rem] font-medium tracking-[0.14em] uppercase"
                    style={{ backgroundColor: "#2563EB", color: "#fff" }}
                  >
                    À lire en premier
                  </span>
                  <span className="text-[0.72rem] tracking-[0.12em] uppercase text-[#8fb4f0]">
                    {lead.category}
                  </span>
                  <span className="text-[0.72rem] text-[#6d7a99]">
                    {formatDate(lead.date)} · {lead.readingTime} min
                  </span>
                </div>

                <h2 className="display mt-6 max-w-3xl text-3xl sm:text-4xl lg:text-[2.8rem]">
                  {lead.title}
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#a9bad8] sm:text-base">
                  {lead.excerpt}
                </p>

                <span className="mt-8 inline-flex items-center gap-3 text-[0.76rem] font-semibold tracking-[0.14em] uppercase text-foreground">
                  Lire l&apos;article
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            </Reveal>
          )}

          {/* ---------------- Les autres ---------------- */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {rest.map((a, i) => (
              <Reveal key={a.slug} delay={i * MOTION.stagger} className="h-full">
                <Link
                  to="/blog/$slug"
                  params={{ slug: a.slug }}
                  className="group flex h-full flex-col rounded-3xl p-7 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{
                    backgroundColor: "#0B1020",
                    border: "1px solid #16203a",
                    transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, transform ${MOTION.respond}ms ${EASE_RESPOND}`,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-accent-hover">
                      {a.category}
                    </span>
                    <span className="text-[0.7rem] text-[#5c6a86]">
                      {formatDate(a.date)} · {a.readingTime} min
                    </span>
                  </div>

                  <h2 className="display mt-4 text-xl transition-colors duration-200 group-hover:text-[#93C5FD] sm:text-2xl">
                    {a.title}
                  </h2>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[#8792ad]">
                    {a.excerpt}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-[#93C5FD]">
                    Lire
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
