import { useEffect, useRef } from "react";
import { LOOP } from "@/config/motion";

/**
 * ULTRA VISION — l'iris du hero.
 *
 * L'IDEE
 *
 * Le hero affichait le logo en grand alors que la navigation le montre
 * deja juste au-dessus. Deux fois la meme chose en trois cents pixels :
 * le signe d'une page qui n'a rien d'autre a montrer.
 *
 * A la place, le symbole de la marque agrandi jusqu'a deborder du cadre,
 * en rotation lente, et qui s'incline vers le curseur. Il ne s'agit plus
 * d'un logo pose sur la page : c'est l'espace dans lequel la page existe.
 *
 * DEUX MOUVEMENTS SUPERPOSES
 *
 * 1. La rotation. Deux minutes par tour. A cette vitesse on ne la voit
 *    pas bouger, on la sent. Une rotation visible ferait gadget.
 *
 * 2. L'inclinaison vers le curseur. Le symbole se decale de quelques
 *    pixels dans la direction de la souris, avec de l'inertie. C'est ce
 *    qui donne l'impression d'un oeil qui suit le visiteur.
 *
 * POURQUOI DEUX ELEMENTS IMBRIQUES
 *
 * Un seul element ne peut pas porter les deux mouvements : la rotation
 * en CSS ecraserait le deplacement, et inversement. L'exterieur porte
 * donc le suivi du curseur, l'interieur porte la rotation. Chacun son
 * `transform`, aucun conflit.
 *
 * TROIS PRECAUTIONS
 *
 * - Le voile degrade a gauche garantit que le titre reste lisible.
 * - Rien ne se declenche sur ecran tactile : il n'y a pas de curseur a
 *   suivre, et ecouter les evenements pour rien coute de la batterie.
 * - Tout s'arrete si l'utilisateur a demande moins d'animations.
 *
 * On n'anime que `transform`, la seule propriete que la carte graphique
 * traite sans recalculer la mise en page.
 */

export function IrisBackdrop() {
  const followRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = followRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Pas de curseur sur un ecran tactile : on n'ecoute rien.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      // Amplitude volontairement faible : 22 px au maximum. Au-dela,
      // le symbole se met a suivre la souris de facon comique.
      targetX = (e.clientX / window.innerWidth - 0.5) * 44;
      targetY = (e.clientY / window.innerHeight - 0.5) * 44;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      // Interpolation a 6 % : l'iris rattrape le curseur avec retard.
      // C'est ce retard qui donne la sensation de masse.
      x += (targetX - x) * 0.06;
      y += (targetY - y) * 0.06;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) {
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
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[78%] select-none md:block"
    >
      <style>{`
        @keyframes uv-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .uv-iris { animation: uv-spin ${LOOP.iris}s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .uv-iris { animation: none; } }
      `}</style>

      {/* Couche exterieure : suit le curseur */}
      <div ref={followRef} className="absolute inset-0 will-change-transform">
        {/* Couche interieure : tourne */}
        <img
          src="/brand/icon/ultravision-icon-blue.svg"
          alt=""
          className="uv-iris absolute top-1/2 right-[-22%] w-[min(96vh,860px)] -translate-y-1/2 opacity-[0.55]"
          draggable={false}
        />
      </div>

      {/* Voile : le texte passe toujours devant. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #090909 22%, rgba(9,9,9,0.72) 52%, rgba(9,9,9,0) 88%)",
        }}
      />
    </div>
  );
}
