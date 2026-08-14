import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — les expertises, en mosaique.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/components/ExpertiseList.tsx
 *  Le nom exporte ne change pas : `ExpertiseList`.
 *  Aucun autre fichier n'a besoin d'etre modifie.
 * ============================================================
 *
 * CE QUI REMPLACE QUOI
 *
 * Avant : cinq lignes de meme hauteur, empilees. Une liste dit que les
 * cinq poles se valent et qu'ils se lisent dans l'ordre. Ni l'un ni
 * l'autre n'est vrai. Un visiteur ne cherche pas « les expertises » :
 * il cherche la sienne, et il devait parcourir cinq lignes identiques
 * pour la trouver.
 *
 * Maintenant : cinq panneaux de tailles inegales, dans une grille
 * asymetrique.
 *
 * POURQUOI DES TAILLES INEGALES
 *
 * La surface porte une information. Branding occupe deux fois la
 * hauteur des autres, Creation de contenu toute la largeur restante.
 * Ce sont les deux poles par lesquels un client entre le plus souvent.
 * Web, IA et Acquisition prennent des formats plus courts.
 *
 * Ce n'est pas une decision graphique, c'est une decision commerciale
 * rendue visible. Une grille reguliere aurait dit l'inverse : que tout
 * se vaut, donc que rien ne compte.
 *
 * LA COULEUR
 *
 * Palette du site, inchangee. Au repos, chaque panneau est un bleu
 * nuit tres sombre — presque noir, mais jamais neutre. Au survol, un
 * aplat bleu franc monte remplir le panneau.
 *
 * L'important est que le bleu ne soit PAS present au repos. Cinq
 * panneaux bleus cote a cote redeviendraient une grille uniforme.
 * Le bleu ne sert ici qu'a une chose : designer celui qu'on regarde.
 *
 * SUR TELEPHONE
 *
 * L'asymetrie disparait : une colonne, cinq panneaux de meme hauteur.
 * Une mosaique reduite a 380 px de large ne raconte plus rien, elle
 * fabrique juste des cases minuscules.
 */

/*
 * BRANDING ET CREATION DE CONTENU SONT REUNIS.
 *
 * Ils etaient separes, et c'etait une erreur de decoupage.
 *
 * Ce sont les memes personnes, au meme moment du projet. Une identite
 * qui n'existe que sur une charte n'existe pas : elle prend corps dans
 * les photos, les films et les publicites qui la font circuler. Les
 * annoncer comme deux prestations distinctes obligeait le prospect a
 * comprendre lui-meme qu'il lui fallait les deux — et beaucoup n'en
 * prenaient qu'une.
 *
 * Reunis, ils deviennent la porte d'entree naturelle du site : une
 * marque et tout ce qui la donne a voir. C'est aussi ce que le nouveau
 * sous-titre du hero annonce, « production de contenu audiovisuel et
 * publicite » — les deux devaient se repondre.
 *
 * On passe donc de cinq poles a quatre. Quatre se retiennent ; cinq se
 * subissent.
 */
const POLES = [
  {
    n: "01",
    title: "Marque & Contenu",
    text: "Une identité lisible en trois secondes, et tous les contenus qui la font exister — photo, vidéo, motion, publicité.",
    lines: [
      "Identité visuelle",
      "Positionnement",
      "Charte graphique",
      "Photo & vidéo",
      "Motion design",
    ],
    /* Grand panneau, deux rangees. C'est la porte d'entree du site. */
    area: "lg:col-span-3 lg:row-span-2",
  },
  {
    n: "02",
    title: "Web & Applications",
    text: "Des interfaces rapides, sobres et pensées pour la conversion.",
    lines: ["Sites web", "Applications", "Landing pages"],
    area: "lg:col-span-3",
  },
  {
    n: "03",
    title: "IA & Automatisation",
    text: "Vos processus commerciaux exécutés sans friction, 24 h sur 24.",
    lines: ["Agents IA", "Automatisation", "CRM"],
    area: "lg:col-span-3",
  },
  {
    /*
      Acquisition prend toute la largeur de la derniere rangee.
      C'est le pole qui porte le chiffre, donc celui sur lequel la
      section doit se refermer.
    */
    n: "04",
    title: "Acquisition",
    text: "Un pilotage au coût par rendez-vous qualifié, pas au clic.",
    lines: ["Meta Ads", "Google Ads", "TikTok Ads", "Lead generation"],
    area: "lg:col-span-6",
  },
];

export function ExpertiseList() {
  return (
    <div>
      <Reveal>
        <p className="eyebrow">Nos expertises</p>
        <h2 className="display mt-5 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
          Quatre pôles, une seule équipe, une chaîne de valeur complète.
        </h2>
      </Reveal>

      {/*
        La grille fait six colonnes sur grand ecran, pas cinq. Six se
        divise par 2 et par 3 : c'est ce qui autorise des panneaux de
        largeurs differentes qui retombent quand meme juste. Avec cinq
        colonnes, toute asymetrie laisse un trou en bout de rangee.
      */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 lg:grid-cols-6 lg:grid-rows-[repeat(3,minmax(168px,auto))]">
        {/*
          `h-full` sur l'enveloppe Reveal est indispensable : c'est ELLE
          qui est la case de la grille, pas le panneau qu'elle contient.
          Sans cette hauteur, le panneau « Marque & Contenu » ne
          remplirait pas les deux rangees qui lui sont reservees.

          Ce commentaire est place ICI, avant l'appel a `.map()`, et non
          a l'interieur. Un commentaire JSX glisse entre la parenthese
          ouvrante d'une fonction flechee et l'element qu'elle renvoie
          produit deux expressions la ou le langage n'en attend qu'une :
          c'est exactement l'erreur qui a fait echouer la construction
          du site le 15 aout 2026.
        */}
        {POLES.map((p, i) => (
          <Reveal key={p.n} delay={i * MOTION.stagger} className={`h-full ${p.area}`}>
            <article
              tabIndex={0}
              className="group relative flex h-full min-h-[176px] flex-col justify-end overflow-hidden rounded-2xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              style={{
                // Bleu nuit tres sombre. Presque noir, jamais neutre :
                // c'est ce qui evite l'effet de trou dans la page.
                backgroundColor: "#0B1020",
                border: "1px solid #16203a",
                transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, transform ${MOTION.respond}ms ${EASE_RESPOND}`,
              }}
            >
              {/*
                L'aplat bleu du survol est une COUCHE separee dont on
                anime l'opacite, et non la couleur de fond du panneau.

                Animer `background-color` d'un bleu nuit vers un bleu
                franc fait passer la transition par des teintes grisees
                et sales au milieu du parcours. Une couche superposee
                evite entierement ce passage.
              */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ background: "linear-gradient(150deg, #2563EB 0%, #1D4ED8 100%)" }}
              />

              <span className="relative z-[2] text-[0.66rem] tracking-[0.16em] tabular-nums text-accent transition-colors duration-200 group-hover:text-[#BFDBFE] group-focus-visible:text-[#BFDBFE]">
                {p.n}
              </span>

              <h3 className="display relative z-[2] mt-auto pt-6 text-2xl sm:text-[1.7rem]">
                {p.title}
              </h3>

              <p className="relative z-[2] mt-2.5 max-w-sm text-sm leading-relaxed text-[#8792ad] transition-colors duration-200 group-hover:text-[#DBE7FF] group-focus-visible:text-[#DBE7FF]">
                {p.text}
              </p>

              {/*
                Les prestations n'apparaissent qu'au survol sur grand
                ecran, et restent visibles en permanence sur telephone —
                ou il n'y a pas de survol pour les reveler.
              */}
              <ul className="relative z-[2] mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[0.72rem] text-[#6d7a99] opacity-100 transition-opacity duration-200 group-hover:text-[#C7D9FF] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                {p.lines.map((l) => (
                  <li key={l} className="flex items-center gap-1.5">
                    <span
                      className="h-px w-2.5 bg-current opacity-50"
                      aria-hidden="true"
                    />
                    {l}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <Link
          to="/services"
          className="group mt-10 inline-flex items-center gap-3 text-[0.78rem] font-semibold tracking-[0.14em] uppercase text-foreground outline-none transition-colors duration-200 hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
        >
          Voir le détail des services
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
