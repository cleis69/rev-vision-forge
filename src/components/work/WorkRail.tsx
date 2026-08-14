import { useEffect, useRef, useState } from "react";
import { statsOf, type WorkItem } from "./work.data";
import { VideoPlayer } from "./VideoPlayer";
import { WorkStats } from "./WorkStats";
import { useIsMobile, useReveal } from "@/hooks/useReveal";
import { EASE_ENTER, EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — le rail des realisations.
 *
 * LE PRINCIPE
 *
 * Les quatre videos occupent l'ecran en permanence, cote a cote. Celle
 * que l'on survole s'elargit, les trois autres se compriment. Le rail
 * glisse vers la gauche des qu'il y en a plus de quatre.
 *
 * C'est la seule mise en page qui tienne les deux exigences a la fois :
 * tout voir d'un coup, et pouvoir defiler pour aller plus loin.
 *
 * ORDINATEUR
 *   Quatre colonnes en flex. La colonne active passe en flex 2.8, les
 *   autres tombent a 0.7. Le survol suffit, aucun clic necessaire.
 *
 * TELEPHONE
 *   Le rail devient un carrousel a accroche magnetique, une video par
 *   ecran. C'est le geste que les visiteurs venus d'Instagram et de
 *   TikTok font toute la journee — inutile de leur en apprendre un autre.
 *   La video active est detectee par observation, pas par survol :
 *   sur un ecran tactile, le survol n'existe pas.
 *
 * PERFORMANCE
 *   Une seule video joue a la fois, celle qui est active. Les autres
 *   restent sur leur image fixe. Avec des fichiers de 5 a 6 Mo, c'est
 *   ce qui separe une page fluide d'une page qui rame.
 *
 * ACCESSIBILITE
 *   Chaque carte est un bouton atteignable au clavier. Le focus active
 *   la carte exactement comme le survol, donc la navigation au clavier
 *   donne acces au meme contenu.
 */

/*
  Vitesses issues de src/config/motion.ts.

  L'ELARGISSEMENT D'UNE CARTE EST UN CAS A PART

  Ce n'est ni une entree ni un survol. C'est un mouvement de mise en
  page : quatre colonnes se redistribuent la largeur disponible.

  A 220 ms — la vitesse d'un survol — les quatre colonnes sautent d'une
  proportion a l'autre et l'oeil ne suit pas ce qui grandit. A 950 ms —
  la vitesse d'une entree — la main a le temps de traverser trois cartes
  avant que la premiere ait fini de s'ouvrir.

  700 ms est le compromis : on voit la carte grandir, et on n'attend pas.
*/
const EASE = EASE_RESPOND;

export function WorkRail({ items }: { items: WorkItem[] }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile(1024);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const { ref: sectionRef, isVisible } = useReveal<HTMLDivElement>({ amount: 0.1 });

  /*
    Sur mobile, la carte active est celle qui occupe le centre du rail.
    On l'observe au lieu de la deviner : c'est le seul moyen fiable quand
    le visiteur fait defiler au doigt avec de l'inertie.
  */
  useEffect(() => {
    if (!isMobile) return;
    const rail = railRef.current;
    if (!rail) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const i = cardRefs.current.indexOf(entry.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { root: rail, threshold: [0.6] },
    );

    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [isMobile, items.length]);

  /*
    PARALLAXE VERTICALE — la mecanique B, greffee sur le rail.

    Chaque colonne derive verticalement a sa propre vitesse pendant le
    scroll : deux montent, deux descendent. Les quatre videos restent
    cote a cote, mais elles cessent de se comporter comme un bloc rigide.

    Trois regles que je m'impose ici :

    - Amplitude faible, 26 px au maximum. Au-dela, les cartes se
      desalignent visiblement et l'on croit a un defaut de mise en page
      plutot qu'a une intention.
    - Vitesses alternees et irregulieres (0.5 / -0.85 / 0.95 / -0.6). Des
      valeurs symetriques produiraient un balancement mecanique.
    - Rien sur mobile. Le rail y defile horizontalement au doigt : une
      derive verticale en plus donnerait un mouvement illisible, et
      chaque image supplementaire coute cher sur un telephone.

    Une seule boucle d'animation pour les quatre cartes, synchronisee sur
    le rafraichissement de l'ecran, qui n'ecrit que dans `transform`.
  */
  const SPEEDS = [0.5, -0.85, 0.95, -0.6];

  useEffect(() => {
    if (isMobile) {
      cardRefs.current.forEach((el) => el && (el.style.transform = ""));
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const r = rail.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quand le rail entre par le bas, 1 quand il sort par le haut.
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1) - 0.5;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(0, ${(p * (SPEEDS[i % SPEEDS.length] ?? 0) * 52).toFixed(2)}px, 0)`;
      });
    };

    const onScroll = () => {
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
  }, [isMobile, items.length]);

  const current = items[active] ?? items[0];

  return (
    <div ref={sectionRef}>
      {/* ---------------- Le rail ---------------- */}
      <div
        ref={railRef}
        className={[
          "uv-rail flex gap-3 sm:gap-4",
          "snap-x snap-mandatory overflow-x-auto pb-4",
          // La marge verticale laisse la place a la derive des colonnes :
          // sans elle, les cartes qui descendent seraient coupees.
          "lg:snap-none lg:overflow-visible lg:py-8 lg:pb-8",
        ].join(" ")}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(28px)",
          transition: `opacity ${MOTION.enter}ms ${EASE_ENTER}, transform ${MOTION.enter}ms ${EASE_ENTER}`,
        }}
      >
        <style>{`
          .uv-rail { scrollbar-width: none; -ms-overflow-style: none; }
          .uv-rail::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <article
              key={item.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => !isMobile && setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
              aria-label={`${item.title} — ${item.category}`}
              className={[
                "group relative shrink-0 snap-center overflow-hidden outline-none",
                // Sur mobile : largeur fixe, une carte par ecran.
                "w-[78vw] max-w-[330px]",
                // Sur grand ecran : la largeur redevient libre.
                //
                // `lg:max-w-none` est indispensable. Sans lui, le plafond de
                // 330 px continue de s'appliquer, les quatre cartes restent
                // identiques et l'accordeon ne peut pas s'ouvrir : flex-grow
                // n'a aucun effet contre un max-width.
                "lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:snap-align-none",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              ].join(" ")}
              style={{
                height: "min(66vh, 560px)",
                borderRadius: 18,
                flexGrow: isMobile ? 0 : isActive ? 2.8 : 0.7,
                flexBasis: isMobile ? "auto" : 0,
                // `transform` est pilote image par image par la parallaxe :
                // il ne doit surtout pas etre en transition, sinon les deux
                // se combattent et le mouvement devient pateux.
                transition: `flex-grow ${MOTION.rail}ms ${EASE}, box-shadow ${MOTION.rail}ms ${EASE}`,
                willChange: "transform",
                boxShadow: isActive
                  ? "0 30px 70px rgba(0,0,0,.7), 0 0 0 1px rgba(59,130,246,.28)"
                  : "0 18px 44px rgba(0,0,0,.55), 0 0 0 1px #262626",
              }}
            >
              <VideoPlayer
                item={item}
                radius={18}
                active={isActive}
                withSound={isActive && i === 0}
                className="!absolute !inset-0 !h-full !w-full"
              />

              {/* Voile de lisibilite */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(9,9,9,.88) 0%, rgba(9,9,9,.25) 34%, rgba(9,9,9,0) 62%)",
                }}
              />

              {/* Numero */}
              <span className="pointer-events-none absolute top-5 left-5 text-[0.7rem] tracking-[0.14em] tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Titre et categorie */}
              <div className="pointer-events-none absolute inset-x-5 bottom-5">
                <p
                  className="text-[0.62rem] font-medium tracking-[0.16em] uppercase text-[#9a9a98]"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity ${MOTION.expand}ms ${EASE} 120ms, transform ${MOTION.expand}ms ${EASE} 120ms`,
                  }}
                >
                  {item.category}
                </p>
                <h3 className="display mt-1.5 text-[1.35rem] leading-tight tracking-[-0.02em] text-foreground sm:text-[1.6rem]">
                  {item.title}
                </h3>
                <p
                  className="mt-2 max-w-xs text-[0.82rem] leading-relaxed text-[#a8a8a6]"
                  style={{
                    opacity: isActive ? 1 : 0,
                    maxHeight: isActive ? 80 : 0,
                    overflow: "hidden",
                    transition: `opacity ${MOTION.expand}ms ${EASE} 180ms, max-height ${MOTION.rail}ms ${EASE}`,
                  }}
                >
                  {item.description}
                </p>

                {/*
                  Le chiffre principal reste visible sur CHAQUE carte, meme
                  comprimee. C'etait le defaut du rail : en ne montrant les
                  resultats que pour la carte active, les trois autres
                  redevenaient de simples images. Un chiffre par carte, et
                  les quatre racontent quelque chose en permanence.
                */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="display text-[1.05rem] leading-none tracking-[-0.02em] text-foreground">
                    {statsOf(item)[0].value}
                  </span>
                  <span className="text-[0.58rem] tracking-[0.14em] uppercase text-[#8A8A8A]">
                    {statsOf(item)[0].label}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ---------------- Indicateur mobile ---------------- */}
      <div className="mt-5 flex items-center gap-2 lg:hidden" aria-hidden="true">
        {items.map((item, i) => (
          <span
            key={item.slug}
            className="h-[2px] flex-1 rounded-full"
            style={{
              background: i === active ? "#3B82F6" : "#262626",
              transition: `background ${MOTION.expand}ms ease`,
            }}
          />
        ))}
      </div>

      {/* ---------------- Chiffres de la realisation active ---------------- */}
      <div className="mt-12 sm:mt-16">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="text-[0.7rem] tracking-[0.14em] tabular-nums text-accent">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-8 bg-hairline" aria-hidden="true" />
          <span className="text-[0.72rem] font-medium tracking-[0.16em] uppercase text-muted-foreground">
            {current.title}
          </span>
        </div>

        {/*
          La cle force React a remonter le bloc a chaque changement de
          realisation. Sans elle, les chiffres se contenteraient de
          changer de valeur d'un coup ; avec elle, ils rejouent leur
          apparition et leur compteur.
        */}
        <WorkStats key={current.slug} stats={statsOf(current)} delay={0} />
      </div>
    </div>
  );
}
