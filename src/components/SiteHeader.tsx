import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { Magnetic } from "./Magnetic";

/**
 * ULTRA VISION — navigation.
 *
 * DEUX CORRECTIONS DEMANDEES
 *
 * 1. LE LOGO ETAIT TROP PETIT. Il passe de 28 a 40 px de haut. Sur une
 *    barre de 80 px, un logo de 28 px flotte au milieu du vide et ne
 *    pese rien face au bouton d'appel a l'action. A 40 px il occupe la
 *    moitie de la hauteur : c'est le rapport habituel, et la marque
 *    reprend le dessus sur le bouton.
 *
 * 2. LA PASTILLE ETAIT MAL PLACEE. Perdue au-dessus du titre, elle
 *    ressemblait a une etiquette oubliee. Elle remonte au centre, sur
 *    une premiere ligne au-dessus de la navigation — la position que
 *    SUPRA utilise, et qui fonctionne pour une raison simple : c'est le
 *    premier element que l'oeil rencontre, avant meme le logo.
 *
 *    Elle s'efface des que le visiteur scrolle. Une phrase de
 *    positionnement a rempli son role au premier ecran ; la garder
 *    ensuite volerait de la place a la navigation sans rien ajouter.
 *
 * LE FOND
 *
 * Pose en couleur explicite et non via `bg-background/75`. Cette classe
 * calculait un noir totalement transparent : la barre n'avait aucun
 * fond, a aucun moment. Invisible tant que la page etait noire, le
 * defaut sautait aux yeux des l'ajout de la section claire.
 */

/*
  « Tarifs » est place juste apres « Realisations », et non en fin de
  navigation.

  L'ordre reproduit le trajet reel du visiteur : il regarde d'abord ce
  qu'on sait faire, puis ce que ca coute. Un lien tarifs relegue en
  derniere position se lit comme une information qu'on aurait preferé
  ne pas donner — exactement l'inverse du message de la page.
*/
const NAV = [
  { to: "/services", label: "Services" },
  { to: "/realisations", label: "Réalisations" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

/**
 * Fil bleu qui se remplit au fil du defilement.
 *
 * ------------------------------------------------------------
 * POURQUOI IL SACCADAIT, ET CE QUI A CHANGE
 *
 * La version precedente cumulait trois defauts qui se combinaient :
 *
 * 1. ELLE ANIMAIT `width`. Changer une largeur oblige le navigateur a
 *    recalculer la mise en page a chaque image. C'est l'operation la
 *    plus couteuse qui existe. Seuls `transform` et `opacity` sont
 *    traites directement par la carte graphique.
 *
 * 2. ELLE AVAIT UNE TRANSITION DE 120 ms. Le defilement produit un
 *    evenement toutes les 8 a 16 ms. Chaque nouvelle valeur interrompait
 *    donc la transition precedente avant qu'elle ne se termine : le
 *    filet passait son temps a repartir vers une cible qui avait deja
 *    change. C'est exactement ce qui produit la saccade.
 *
 * 3. ELLE PASSAIT PAR L'ETAT REACT. Chaque pixel defile declenchait un
 *    nouveau rendu de toute la barre de navigation, alors qu'un seul
 *    element devait bouger.
 *
 * La version ci-dessous ecrit directement dans le style de l'element,
 * via `transform: scaleX()`, sans transition, et une seule fois par
 * image d'ecran grace a `requestAnimationFrame`. Le filet est alors
 * exactement synchronise avec le defilement — il ne le rattrape plus,
 * il en fait partie.
 * ------------------------------------------------------------
 */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      // scaleX plutot que width : aucune mise en page recalculee.
      el.style.transform = `scaleX(${p})`;
      // L'ombre ne s'allume qu'une fois le defilement commence, sinon
      // un point lumineux flotte a gauche sur une barre vide.
      el.style.boxShadow = p > 0.002 ? "0 0 12px rgba(59,130,246,.55)" : "none";
    };

    const onScroll = () => {
      // Une seule ecriture par image d'ecran, quoi qu'il arrive.
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full w-full origin-left will-change-transform"
        style={{
          background: "linear-gradient(90deg, #1D4ED8, #3B82F6 55%, #60A5FA)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: solid ? "rgba(9, 9, 9, 0.88)" : "transparent",
        backdropFilter: solid ? "blur(20px)" : "none",
        WebkitBackdropFilter: solid ? "blur(20px)" : "none",
        borderBottom: solid ? "1px solid #262626" : "1px solid transparent",
      }}
    >
      <style>{`
        /* Le trait, trace de gauche a droite. On anime scaleX et non
           width : aucune mise en page recalculee, donc aucun a-coup. */
        .uv-nav::after{
          content:"";position:absolute;left:0;right:0;bottom:-6px;height:1.5px;border-radius:2px;
          background:linear-gradient(90deg,#3B82F6,#60A5FA);
          transform:scaleX(0);transform-origin:right;
          transition:transform 220ms cubic-bezier(.22,1,.36,1);
        }
        .uv-nav:hover::after,.uv-nav:focus-visible::after{transform:scaleX(1);transform-origin:left}
        .uv-nav-on::after{transform:scaleX(1);transform-origin:left}

        /* Le point, devant le mot. Il pousse le texte de 10 px vers la
           droite : le lien avance quand on le vise, il ne se contente
           pas de changer de couleur. */
        .uv-nav::before{
          content:"";position:absolute;left:-12px;top:50%;width:4px;height:4px;border-radius:50%;
          background:#60A5FA;opacity:0;transform:translateY(-50%) scale(.4);
          transition:opacity 220ms cubic-bezier(.22,1,.36,1),transform 220ms cubic-bezier(.22,1,.36,1);
        }
        .uv-nav{transition:color 200ms cubic-bezier(.22,1,.36,1),transform 220ms cubic-bezier(.22,1,.36,1)}
        .uv-nav:hover,.uv-nav:focus-visible{transform:translateX(5px)}
        .uv-nav:hover::before,.uv-nav:focus-visible::before,.uv-nav-on::before{opacity:1;transform:translateY(-50%) scale(1)}
        .uv-nav-on{transform:translateX(5px)}

        @media (prefers-reduced-motion: reduce){
          .uv-nav,.uv-nav::after,.uv-nav::before{transition:none}
          .uv-nav:hover{transform:none}
        }
      `}</style>

      {/* --- Ligne de positionnement, visible en haut de page seulement --- */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-500"
        style={{
          maxHeight: scrolled ? 0 : 56,
          opacity: scrolled ? 0 : 1,
        }}
      >
        <div className="flex justify-center pt-4 pb-1">
          <AvailabilityBadge />
        </div>
      </div>

      {/* --- Barre de navigation --- */}
      <div className="shell grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:flex lg:justify-between">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)} aria-label="ULTRA VISION">
          <Logo className="h-9 sm:h-10" />
        </Link>

        {/*
          TYPOGRAPHIE DE LA BARRE, selon la charte.

          La charte prevoit Inter 400 pour le corps et Inter 600 pour les
          boutons. La navigation se place entre les deux : Inter 500,
          avec un interlettrage de 0,04em et une taille de 13 px.

          Les liens etaient jusqu'ici en Inter 400 a 14 px, la meme
          graisse que les paragraphes du site. Une navigation qui a le
          poids d'un paragraphe ne se lit pas comme une navigation : elle
          se fond dans la page au lieu de la structurer.
        */}
        {/*
          LES LIENS DE NAVIGATION

          Police : Inter 500, 13 px, interlettrage 0,04 em. C'est la
          graisse prevue par la charte pour la navigation — entre le
          corps de texte en 400 et les boutons en 600. Ils etaient
          auparavant dans la meme graisse que les paragraphes, ce qui
          faisait qu'ils se fondaient dans la page au lieu de la
          structurer.

          Couleur : un bleu desature au repos (#8FA8CC), l'accent plein
          au survol (#60A5FA).

          Le repos n'est volontairement PAS le bleu de la marque. Quatre
          liens en bleu franc en permanence, et le bleu cesse d'etre un
          accent : il ne peut plus rien designer, y compris le bouton
          d'appel a l'action juste a cote. Le bleu desature garde la
          teinte de la charte tout en laissant au survol de quoi monter.

          L'ANIMATION : un trait qui se trace de gauche a droite, et un
          point qui s'allume devant le mot. Le trait seul est le geste le
          plus banal du web ; le point le date et le rattache a la marque,
          puisque c'est la meme pastille bleue que dans les eyebrows.
        */}
        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="uv-nav group relative text-[0.82rem] font-medium tracking-[0.04em] text-[#8FA8CC] transition-colors duration-200 hover:text-[#60A5FA]"
              activeProps={{ className: "uv-nav uv-nav-on relative text-[0.82rem] font-medium tracking-[0.04em] text-[#60A5FA]" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Magnetic strength={0.22} radius={90}>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-xs font-medium tracking-[0.12em] uppercase text-background transition-colors duration-300 hover:bg-accent-hover"
            >
              Prendre rendez-vous
            </Link>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 items-center justify-center lg:hidden"
        >
          <span className="relative block h-3 w-6">
            <span
              className={`absolute left-0 block h-px w-6 bg-foreground transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-foreground transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      {/*
        Fil bleu de progression.

        Une ligne de deux pixels qui se remplit au fil du scroll. C'est
        la seule presence du bleu qui traverse TOUTE la page : quelle que
        soit la section regardee, l'accent de la marque est visible.

        Elle sert aussi a quelque chose : sur une page de dix mille
        pixels, le visiteur ne sait pas ou il en est. Le fil le lui dit
        sans occuper un centimetre carre.
      */}
      <ScrollProgress />

      {/* --- Menu mobile --- */}
      <div
        className={`overflow-hidden border-t border-hairline lg:hidden ${open ? "max-h-[32rem]" : "max-h-0"} transition-[max-height] duration-500`}
        style={{ backgroundColor: "#090909" }}
      >
        <nav className="shell flex flex-col gap-5 py-8">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="display text-3xl"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-xs font-medium tracking-[0.12em] uppercase text-background"
          >
            Prendre rendez-vous
          </Link>
        </nav>
      </div>
    </header>
  );
}
