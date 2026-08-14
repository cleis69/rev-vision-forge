import { useEffect, useRef } from "react";
import { PLATFORMS } from "./PlatformChip";

/**
 * ULTRA VISION — les plateformes en pastilles flottantes.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/components/FloatingPlatforms.tsx
 * ============================================================
 *
 * CE QUE C'EST
 *
 * Trois pastilles vitrees — Meta, Google Ads, TikTok — posees dans la
 * moitie droite du hero, par-dessus l'iris. Elles derivent avec le
 * curseur, chacune a sa propre amplitude.
 *
 * POURQUOI DANS LE HERO ET PAS PLUS BAS
 *
 * Un visiteur qui arrive sur un site d'agence se pose une seule
 * question : est-ce qu'ils font ce que je cherche ? Trois logos connus
 * y repondent avant que la premiere phrase ne soit lue. Places en bas
 * de page, ils confirment ; places dans le hero, ils qualifient.
 *
 * LE BALAYAGE, ET POURQUOI IL Y A DE L'INERTIE
 *
 * Les pastilles ne collent pas au curseur : elles le rattrapent a 6 %
 * par image. Ce retard est tout l'effet. Un element qui suit la souris
 * au pixel pres a l'air scotche dessus ; un element qui met un instant
 * a repondre a l'air de peser quelque chose et de flotter dans un
 * espace.
 *
 * LES AMPLITUDES SONT DIFFERENTES POUR CHAQUE PASTILLE
 *
 * 0,55 / 1,0 / 1,45 fois l'amplitude de base. Des amplitudes egales
 * feraient bouger les trois pastilles comme une plaque rigide. En les
 * decalant, elles se separent : c'est de la parallaxe, et c'est ce qui
 * cree la profondeur. L'iris derriere bouge encore moins vite — donc
 * il est percu comme etant plus loin.
 *
 * L'AXE VERTICAL EST VOLONTAIREMENT REDUIT
 *
 * 72 % de l'amplitude horizontale. Un ecran est plus large que haut :
 * a amplitude egale, le mouvement vertical parait exagere.
 *
 * QUATRE PRECAUTIONS
 *
 * - Rien sur ecran tactile. Il n'y a pas de curseur a suivre, et sur
 *   petit ecran ces pastilles chevaucheraient le titre. Elles sont
 *   masquees en dessous de 1024 px.
 * - Tout s'arrete si le visiteur a demande moins d'animations.
 * - `pointer-events: none` : elles ne volent jamais un clic au bouton
 *   d'appel a l'action, qui est juste en dessous.
 * - Une seule boucle d'animation pour les trois, et elle n'ecrit que
 *   dans `transform` — la seule propriete que la carte graphique traite
 *   sans recalculer la mise en page.
 *
 * AUCUN NOUVEAU FICHIER IMAGE
 *
 * Les logos sont ceux qui existent deja dans public/brand/platforms/,
 * declares une seule fois dans PlatformChip.tsx. Ajouter une plateforme
 * la-bas l'ajoute ici automatiquement.
 */

/** Position de chaque pastille, et sa part d'amplitude. */
const SLOTS = [
  { top: "16%", left: "56%", drift: 0.55 },
  { top: "44%", left: "72%", drift: 1.0 },
  { top: "70%", left: "60%", drift: 1.45 },
];

/** Amplitude de base du balayage, en pixels. */
const AMPLITUDE = 26;

export function FloatingPlatforms() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      // Position du curseur ramenee entre -1 et 1, quel que soit l'ecran.
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      // Rattrapage a 6 % par image : c'est ce retard qui donne la masse.
      x += (targetX - x) * 0.06;
      y += (targetY - y) * 0.06;

      chipRefs.current.forEach((el, i) => {
        if (!el) return;
        const k = AMPLITUDE * (SLOTS[i]?.drift ?? 1);
        el.style.transform = `translate3d(${(x * k).toFixed(2)}px, ${(y * k * 0.72).toFixed(2)}px, 0)`;
      });

      if (Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] hidden select-none lg:block"
    >
      {PLATFORMS.map((p, i) => {
        const slot = SLOTS[i];
        if (!slot) return null;

        return (
          <div
            key={p.label}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className="absolute will-change-transform"
            style={{ top: slot.top, left: slot.left }}
          >
            <div
              className="flex items-center gap-2.5 rounded-full border border-[#262a35] px-4 py-2.5"
              style={{
                background: "rgba(13,13,16,0.86)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 12px 34px rgba(0,0,0,.5)",
              }}
              title={p.label}
            >
              <img
                src={`/brand/platforms/${p.file}`}
                alt=""
                className="w-auto shrink-0"
                style={{ height: p.height ?? 16 }}
                draggable={false}
              />
              <span className="text-[0.72rem] whitespace-nowrap text-[#C8C8C6]">
                {p.suffix ?? p.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
