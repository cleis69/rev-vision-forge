import { useEffect, useRef, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { EASE_PAGE, PAGE } from "@/config/motion";

/**
 * ULTRA VISION — changement de page : la profondeur.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/components/PageTransition.tsx
 *
 *  ATTENTION : l'usage change. Le composant ENVELOPPE desormais
 *  le contenu au lieu d'etre pose a cote.
 *
 *    Avant :  <PageTransition />
 *             <main><Outlet /></main>
 *
 *    Maintenant :
 *             <main><PageTransition><Outlet /></PageTransition></main>
 *
 *  Le fichier src/routes/__root.tsx fourni avec celui-ci fait
 *  deja ce changement. Les deux vont ensemble.
 * ============================================================
 *
 * CE QUI REMPLACE QUOI
 *
 * L'obturateur a iris durait 1 560 ms et posait une forme opaque
 * par-dessus la page. Deux problemes.
 *
 * Le premier est la duree. Sur un site ou l'on visite quatre ou cinq
 * pages, une seconde et demie a chaque clic finit par se sentir. Une
 * transition ne doit jamais devenir un peage.
 *
 * Le second est plus profond. Poser une forme par-dessus la page, c'est
 * masquer le changement au lieu de le raconter. Le visiteur ne voit pas
 * une page succeder a une autre : il voit un rideau, puis une page.
 *
 * LE PRINCIPE RETENU
 *
 * Rien n'est pose par-dessus. C'est le contenu lui-meme qui bouge.
 *
 *   La page qu'on quitte RECULE — elle rapetisse, se floute, s'efface.
 *   La page qui arrive AVANCE — elle entre legerement trop grande,
 *   nette, et se pose a sa taille exacte.
 *
 * Les deux mouvements ne sont pas symetriques, et c'est volontaire :
 * un objet qui s'eloigne et un objet qui approche ne parcourent pas le
 * meme chemin. C'est cette dissymetrie qui fait lire l'ecran comme un
 * espace a plusieurs plans plutot que comme une surface plate.
 *
 * DEUX TEMPS TRES INEGAUX
 *
 *   sortie 200 ms — on quitte vite. Personne ne regarde ce qu'il quitte.
 *   entree 440 ms — on arrive lentement. C'est la que tout se joue.
 *
 * Accorder autant de temps aux deux serait accorder autant
 * d'importance a la page abandonnee qu'a celle qu'on decouvre.
 *
 * POURQUOI LE FLOU EST INDISPENSABLE
 *
 * Une mise a l'echelle seule se lit comme un zoom, c'est-a-dire comme
 * un changement de taille. Ajouter le flou fait basculer la lecture :
 * ce n'est plus la taille qui change, c'est la distance. C'est
 * exactement le comportement d'un objectif, et le cerveau le decode
 * sans qu'on ait rien a lui expliquer.
 *
 * COMMENT LA SORTIE EST DECLENCHEE
 *
 * Difficulte reelle : quand le routeur signale que l'adresse a change,
 * l'ancienne page est deja demontee. Il est trop tard pour l'animer.
 *
 * On ecoute donc le clic sur les liens internes, en phase de capture,
 * c'est-a-dire avant que le routeur ne reagisse. Le recul commence a
 * l'instant du clic ; la navigation suit. L'animation est ainsi calee
 * sur le geste du visiteur, pas sur la mecanique du routeur.
 *
 * QUATRE PRECAUTIONS
 *
 * - Filet de securite : si aucune navigation ne suit le clic — lien
 *   annule, ancre sur la meme page, erreur — le contenu revient a la
 *   normale au bout de 700 ms. Une page ne reste jamais effacee.
 * - Les liens externes, les nouvelles fenetres et les clics avec Cmd,
 *   Ctrl ou Maj sont ignores : ils n'entrainent aucun changement de page.
 * - Rien au premier chargement.
 * - Entierement neutralise si le visiteur a demande moins d'animations.
 *   Un mouvement plein ecran est exactement ce qui declenche les genes
 *   vestibulaires.
 */

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const safety = useRef(0);

  /* Remet le contenu dans son etat normal. */
  const clear = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
    el.style.filter = "";
    el.style.willChange = "";
  };

  /* --- La sortie : declenchee au clic, avant le routeur --------------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      // Un clic modifie ouvre ailleurs : la page courante ne bouge pas.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target && link.target !== "_self") return;

      const href = link.getAttribute("href");
      // Interne uniquement : commence par une seule barre oblique.
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      // Deja sur cette page : il n'y aura pas de navigation a accompagner.
      if (href.split("#")[0] === window.location.pathname) return;

      const el = ref.current;
      if (!el) return;

      el.style.willChange = "transform, opacity, filter";
      el.style.transition = [
        `transform ${PAGE.out}ms ${EASE_PAGE}`,
        `opacity ${PAGE.out}ms ease-out`,
        `filter ${PAGE.out}ms ease-out`,
      ].join(", ");
      el.style.transform = "scale(.965)";
      el.style.opacity = "0";
      el.style.filter = "blur(6px)";

      // Filet : si la navigation n'a pas lieu, on remet tout en place.
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(clear, PAGE.out + 500);
    };

    // Capture : on passe avant le gestionnaire du routeur.
    window.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      window.clearTimeout(safety.current);
    };
  }, []);

  /* --- L'entree : declenchee par le changement d'adresse -------------- */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clear();
      return;
    }

    window.clearTimeout(safety.current);

    // Etat de depart : legerement trop grande, floue, transparente.
    el.style.transition = "none";
    el.style.transform = "scale(1.035)";
    el.style.opacity = "0";
    el.style.filter = "blur(8px)";
    el.style.willChange = "transform, opacity, filter";

    /*
      Deux images d'attente avant de lancer le mouvement.

      Une seule ne suffit pas : le navigateur peut regrouper le
      changement d'etat et le lancement de la transition dans le meme
      calcul, et la transition ne part alors jamais. La page apparaitrait
      d'un coup, sans animation. C'est le piege classique.
    */
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        el.style.transition = [
          `transform ${PAGE.in}ms ${EASE_PAGE}`,
          // L'opacite et la nettete arrivent en avance sur l'echelle :
          // le texte doit etre lisible pendant que la page finit de se
          // poser, pas seulement une fois qu'elle est posee.
          `opacity ${Math.round(PAGE.in * 0.7)}ms ease-out`,
          `filter ${Math.round(PAGE.in * 0.65)}ms ease-out`,
        ].join(", ");
        el.style.transform = "scale(1)";
        el.style.opacity = "1";
        el.style.filter = "blur(0px)";
      });
    });

    const done = window.setTimeout(clear, PAGE.in + 60);

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      window.clearTimeout(done);
    };
  }, [pathname]);

  /*
    `transform-origin` au centre haut plutot qu'au centre.

    Une page fait plusieurs milliers de pixels de haut. Une mise a
    l'echelle depuis son centre geometrique deplace le haut de la page
    de plusieurs dizaines de pixels — et le haut est precisement ce que
    le visiteur regarde en arrivant. Ancree en haut, la page grandit
    vers le bas et le titre reste ou l'oeil l'attend.
  */
  return (
    <div ref={ref} style={{ transformOrigin: "50% 0%" }}>
      {children}
    </div>
  );
}
