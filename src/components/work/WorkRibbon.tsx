import { useCallback, useEffect, useRef, useState } from "react";
import { statsOf, type WorkItem } from "./work.data";
import { EASE_PAGE, LOOP } from "@/config/motion";

/**
 * ULTRA VISION — le ruban des realisations.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/components/work/WorkRibbon.tsx
 *  Il remplace WorkRail dans VideoShowcase.
 * ============================================================
 *
 * POURQUOI L'ACCORDEON A ETE ABANDONNE
 *
 * L'accordeon precedent elargissait la carte survolee jusqu'a 2,8 fois
 * sa largeur, a hauteur constante. Sur du 16/9 le geste fonctionne : la
 * carte s'ouvre dans le sens de l'image. Sur du 9/16 il fonctionne a
 * l'envers — la carte gagne en largeur ce que l'image perd en cadrage,
 * et le recadrage automatique coupe environ 70 % de la scene.
 *
 * Toutes nos videos sont verticales. La mecanique etait donc structurellement
 * inadaptee, pas mal reglee.
 *
 * CE QUI LA REMPLACE
 *
 * Un ruban qui defile en continu. Aucune carte ne change jamais de
 * proportion : le 9/16 est tenu a chaque instant. Le survol arrete le
 * defilement, avance la carte visee et fait reculer les autres.
 *
 * TROIS PLANS DE PROFONDEUR, UNE SEULE DIRECTION DE LUMIERE
 *
 * 1. AU FOND — le contre-jour. Une barre de lumiere bleue horizontale,
 *    posee DERRIERE le ruban, avec un coeur incandescent. Elle respire
 *    lentement.
 *
 *    Le contre-jour est le seul eclairage qui separe reellement un sujet
 *    de son fond. C'est pour cette raison qu'il est utilise ici et non
 *    une simple tache lumineuse : les cartes cessent d'etre collees a la
 *    page, elles s'en detachent.
 *
 * 2. AU MILIEU — les cartes. Elles recoivent un lisere froid sur leurs
 *    aretes, consequence directe de la lumiere placee derriere elles.
 *    Un objet eclaire par l'arriere s'ourle de lumiere sur son contour :
 *    sans ce lisere, le contre-jour ne serait qu'un fond colore.
 *
 * 3. DEVANT — la profondeur de champ. Les deux extremites du ruban sont
 *    floutees et assombries. Les cartes emergent d'une zone de flou et y
 *    retournent, au lieu d'entrer et sortir par un bord net.
 *
 * LA VIDEO
 *
 * Le ruban affiche des images fixes. La video ne se charge QUE sur la
 * carte survolee, une seule a la fois, et se decharge des qu'on la
 * quitte. Avec des fichiers de 5 a 6 Mo repetes le long du ruban, tout
 * autre choix rendrait la page inutilisable.
 *
 * L'ACCESSIBILITE
 *
 * La liste est dupliquee pour que la boucle soit invisible. Le second
 * exemplaire porte `aria-hidden` et n'est pas atteignable au clavier :
 * un lecteur d'ecran ne doit pas annoncer huit realisations quand il y
 * en a quatre.
 *
 * LE MOUVEMENT S'ARRETE si le visiteur a demande moins d'animations. Le
 * ruban devient alors une simple bande defilante au doigt ou a la molette.
 */

type Props = {
  items: WorkItem[];
  /** Duree d'un tour complet, en secondes. */
  speed?: number;
};

/** Nombre de fois que la liste est repetee DANS chaque moitie du ruban. */
const REPEAT = 2;

export function WorkRibbon({ items, speed = LOOP.marquee + 12 }: Props) {
  // Cle de la carte survolee : "index dans la sequence". Une seule a la fois.
  const [hovered, setHovered] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  /* La sequence affichee dans UNE moitie du ruban. */
  const sequence: WorkItem[] = [];
  for (let i = 0; i < REPEAT; i++) sequence.push(...items);

  const renderHalf = (copy: number) =>
    sequence.map((item, i) => {
      const key = `${copy}-${i}`;
      return (
        <RibbonCard
          key={key}
          item={item}
          cardKey={key}
          isHovered={hovered === key}
          // Une carte s'assombrit des qu'UNE AUTRE est visee. C'est le
          // contraste qui designe la carte active, jamais un changement
          // de forme : la forme, ici, doit rester intouchable.
          dimmed={hovered !== null && hovered !== key}
          onEnter={() => setHovered(key)}
          onLeave={() => setHovered((h) => (h === key ? null : h))}
          decorative={copy === 1}
        />
      );
    });

  return (
    <div className="relative">
      <style>{`
        @keyframes uv-ribbon { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @keyframes uv-backlight {
          0%   { opacity: .46; height: 200px; }
          100% { opacity: .74; height: 268px; }
        }
        .uv-ribbon-track { animation: uv-ribbon var(--uv-speed) linear infinite; }
        .uv-ribbon-band:hover .uv-ribbon-track { animation-play-state: paused; }
        .uv-backlight { animation: uv-backlight 11s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .uv-ribbon-track { animation: none; }
          .uv-backlight { animation: none; }
        }
        /*
          En dessous de 1024 px le ruban devient une bande que l'on fait
          defiler au doigt. Laisser l'animation tourner en meme temps
          reviendrait a se battre avec le visiteur : le ruban repartirait
          tout seul pendant qu'il essaie de le retenir.
        */
        @media (max-width: 1023px) {
          .uv-ribbon-track { animation: none; }
        }
        /* La barre de defilement du ruban n'apparait jamais. */
        .uv-ribbon-band { scrollbar-width: none; -ms-overflow-style: none; }
        .uv-ribbon-band::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ================= PLAN 1 — LE CONTRE-JOUR ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/*
          La nappe. Elle est centree sur la hauteur du ruban, deborde
          largement sur les cotes, et son opacite comme sa hauteur
          respirent en 11 secondes. Un contre-jour parfaitement stable
          se lit comme un aplat ; il faut qu'il vive un peu.
        */}
        <div
          className="uv-backlight absolute top-1/2 -left-[6%] -right-[6%] -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59,130,246,.62) 16%, rgba(96,165,250,.85) 50%, rgba(59,130,246,.62) 84%, transparent 100%)",
            filter: "blur(58px)",
            mixBlendMode: "screen",
          }}
        />
        {/*
          Le coeur. Un filet quasi blanc, tres flou, au centre exact de
          la nappe. C'est lui qui donne la sensation d'une source et non
          d'un brouillard colore.
        */}
        <div
          className="absolute top-1/2 right-[2%] left-[2%] h-[3px] -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(191,219,254,.9) 32%, #ffffff 50%, rgba(191,219,254,.9) 68%, transparent)",
            filter: "blur(2px)",
            opacity: 0.4,
          }}
        />
        {/*
          Grain. Sans lui, un degrade bleu de cette taille produit des
          cercles concentriques visibles sur les ecrans 8 bits. C'est un
          defaut classique, tres salissant, et invisible tant qu'on ne
          l'a pas remarque une fois.
        */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.9) .5px, transparent .5px)",
            backgroundSize: "3px 3px",
          }}
        />
      </div>

      {/* ================= LE RUBAN ================= */}
      <div
        className="uv-ribbon-band relative z-[4] overflow-x-auto overflow-y-hidden py-8 lg:overflow-hidden"
        style={{ ["--uv-speed" as string]: `${speed}s` }}
      >
        <div
          className="uv-ribbon-track flex w-max gap-4 sm:gap-5"
          style={reduced ? { animation: "none" } : undefined}
        >
          {renderHalf(0)}
          {renderHalf(1)}
        </div>

        {/* ============ PLAN 3 — LA PROFONDEUR DE CHAMP ============ */}
        {/*
          Les deux extremites entrent dans le flou. `backdrop-filter`
          floute ce qui se trouve DERRIERE ces voiles, donc les cartes
          qui les traversent — sans qu'aucune carte n'ait besoin d'etre
          floutee individuellement.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-[7] hidden w-[23%] lg:block"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            background:
              "linear-gradient(90deg, rgba(9,9,9,.62) 6%, rgba(9,9,9,.3) 56%, transparent 100%)",
            maskImage: "linear-gradient(90deg, #000 34%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, #000 34%, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-[7] hidden w-[23%] lg:block"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            background:
              "linear-gradient(270deg, rgba(9,9,9,.62) 6%, rgba(9,9,9,.3) 56%, transparent 100%)",
            maskImage: "linear-gradient(270deg, #000 34%, transparent)",
            WebkitMaskImage: "linear-gradient(270deg, #000 34%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
 *  UNE CARTE
 * ========================================================================== */

function RibbonCard({
  item,
  isHovered,
  dimmed,
  onEnter,
  onLeave,
  decorative,
}: {
  item: WorkItem;
  cardKey: string;
  isHovered: boolean;
  /** Vrai quand une AUTRE carte est survolee. */
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  /** Vrai pour le second exemplaire, celui qui n'existe que pour la boucle. */
  decorative: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stat = statsOf(item)[0];

  /* La video ne demarre que lorsque la carte est survolee. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isHovered) {
      v.play().catch(() => {
        /* Le navigateur peut refuser. Ce n'est pas une erreur : l'image
           fixe reste affichee, et le visiteur ne voit aucune difference. */
      });
    } else {
      v.pause();
    }
  }, [isHovered]);

  const handleEnter = useCallback(() => onEnter(), [onEnter]);

  /*
    LES OMBRES DE LA CARTE, EN QUATRE COUCHES

    1. Un lisere froid en haut et sur les cotes. C'est la consequence
       directe du contre-jour : un objet eclaire par derriere s'ourle de
       lumiere sur son contour. Sans lui, la nappe bleue ne serait qu'un
       fond colore.
    2. Une arete sombre en bas, la ou aucune lumiere n'arrive.
    3. Une ombre projetee decalee vers la droite et vers le bas.
    4. Un filet blanc a 4,5 % qui detache la carte du fond quand elle
       passe devant une zone claire de la nappe.
  */
  const restShadow = [
    "inset 0 1px 0 rgba(191,219,254,.34)",
    "inset 1px 0 0 rgba(147,197,253,.2)",
    "inset -1px 0 0 rgba(147,197,253,.2)",
    "inset 0 -1px 0 rgba(0,0,0,.55)",
    "0 26px 54px -20px rgba(0,0,0,.94)",
    "0 8px 18px -8px rgba(0,0,0,.66)",
    "0 0 0 1px rgba(255,255,255,.045)",
  ].join(", ");

  const hoverShadow = [
    "inset 0 1px 0 rgba(191,219,254,.5)",
    "inset 1px 0 0 rgba(147,197,253,.32)",
    "inset -1px 0 0 rgba(147,197,253,.32)",
    "inset 0 -1px 0 rgba(0,0,0,.6)",
    "0 46px 84px -24px rgba(0,0,0,.96)",
    "0 16px 32px -10px rgba(0,0,0,.74)",
    "0 0 0 1px rgba(96,165,250,.46)",
    "0 0 76px -16px rgba(59,130,246,.6)",
  ].join(", ");

  return (
    <article
      onMouseEnter={handleEnter}
      onMouseLeave={onLeave}
      onFocus={decorative ? undefined : handleEnter}
      onBlur={decorative ? undefined : onLeave}
      tabIndex={decorative ? -1 : 0}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `${item.title} — ${item.category}`}
      className="group relative aspect-[9/16] w-[190px] shrink-0 cursor-pointer overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-[214px] lg:w-[238px]"
      style={{
        borderRadius: 17,
        transform: isHovered ? "translateY(-16px) scale(1.06)" : "translateY(0) scale(1)",
        boxShadow: isHovered ? hoverShadow : restShadow,
        // Les cartes non survolees reculent des qu'une autre est visee.
        filter: dimmed ? "brightness(.52) saturate(.55)" : "none",
        zIndex: isHovered ? 9 : 1,
        transition: `transform 480ms ${EASE_PAGE}, box-shadow 480ms ${EASE_PAGE}, filter 480ms ${EASE_PAGE}`,
      }}
    >
      {/* --- L'image fixe, toujours presente --- */}
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
          style={{
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: `transform 950ms ${EASE_PAGE}`,
          }}
        />
      </picture>

      {/* --- La video : montee uniquement au survol --- */}
      {isHovered && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        >
          {item.sources.mobile && (
            <source src={item.sources.mobile} type="video/mp4" media="(max-width: 768px)" />
          )}
          <source src={item.sources.mp4} type="video/mp4" />
        </video>
      )}

      {/* --- Nappe de lumiere fixe : elle donne le volume --- */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          mixBlendMode: "screen",
          background:
            "linear-gradient(116deg, rgba(255,255,255,.18) 0%, rgba(190,215,255,.05) 24%, transparent 46%)",
        }}
      />

      {/* --- Reflet mobile, declenche au survol --- */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[45%] -bottom-[45%] z-[5] w-1/2"
        style={{
          background:
            "linear-gradient(100deg, transparent, rgba(255,255,255,.18) 44%, rgba(214,228,255,.3) 52%, transparent)",
          transform: isHovered
            ? "translateX(330%) rotate(7deg)"
            : "translateX(-230%) rotate(7deg)",
          transition: `transform 900ms ${EASE_PAGE}`,
        }}
      />

      {/* --- Voile de lisibilite --- */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(to top, rgba(9,9,9,.93) 3%, rgba(9,9,9,.2) 42%, transparent 68%)",
        }}
      />

      {/* --- Bouton de lecture, au survol --- */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-[6] flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 backdrop-blur-sm"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: `opacity 300ms ${EASE_PAGE}`,
        }}
      >
        <svg width="14" height="16" viewBox="0 0 20 22" fill="#fff" className="ml-[3px]">
          <path d="M0 1.2C0 .3 1 -.3 1.8.2l17 9.8c.8.5.8 1.6 0 2L1.8 21.8C1 22.3 0 21.7 0 20.8V1.2Z" />
        </svg>
      </span>

      {/* --- Informations --- */}
      <div className="absolute inset-x-0 bottom-0 z-[6] p-4">
        <p className="text-[0.54rem] tracking-[0.16em] uppercase text-accent-hover">
          {item.category}
        </p>
        <h3 className="display mt-1 truncate text-[1rem] text-foreground">{item.title}</h3>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="display text-[0.92rem] text-foreground">{stat.value}</span>
          <span className="text-[0.49rem] tracking-[0.13em] text-[#a9a9a5]">{stat.label}</span>
        </div>
      </div>
    </article>
  );
}
