import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * ULTRA VISION — enveloppe de la section blog.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/blog.tsx
 *
 *  IL NE FAUT PAS LE SUPPRIMER, ET IL NE FAUT RIEN Y AJOUTER.
 *  La liste des articles vit maintenant dans blog.index.tsx.
 * ============================================================
 *
 * LE BUG QUE CE FICHIER CORRIGE
 *
 * Constate en ligne le 15 aout 2026 : ouvrir
 * /blog/tofu-mofu-bofu-video-publicitaire affichait la LISTE des
 * articles au lieu de l'article.
 *
 * Le plus trompeur, c'est que tout le reste fonctionnait. Le titre de
 * l'onglet etait celui de l'article, l'adresse canonique aussi, les
 * donnees structurees aussi. La route etait donc bien trouvee et son
 * `head()` bien execute : seul le CORPS de la page etait faux.
 *
 * L'explication tient en une phrase. Des lors qu'il existe un fichier
 * blog.$slug.tsx, l'adresse /blog cesse d'etre une page et devient un
 * PARENT. Un parent ne s'efface pas devant son enfant, il l'entoure —
 * et il doit lui reserver une place avec <Outlet />. L'ancien
 * blog.tsx affichait la liste et ne contenait aucun Outlet : l'article
 * n'avait aucun endroit ou s'afficher, donc c'est le parent qu'on
 * voyait.
 *
 * D'ou la separation en trois fichiers :
 *
 *   blog.tsx        ce fichier. Uniquement <Outlet />.
 *   blog.index.tsx  la page /blog, c'est-a-dire la liste.
 *   blog.$slug.tsx  un article.
 *
 * AUCUNE BALISE `head` ICI, VOLONTAIREMENT.
 *
 * Les balises d'un parent sont heritees par ses enfants. En laisser
 * ici ferait apparaitre le titre « Blog » sur chaque article, en
 * concurrence avec le sien. Chaque page declare les siennes, et elle
 * seule.
 */

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  /*
    Aucun habillage autour de l'Outlet : pas de conteneur, pas de
    marge, pas de section. La liste et les articles ont chacun leur
    propre mise en page, et un conteneur supplementaire ici viendrait
    s'ajouter aux leurs — ce qui produirait des marges doublees
    impossibles a comprendre depuis les fichiers enfants.
  */
  return <Outlet />;
}
