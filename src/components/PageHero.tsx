import { MaskReveal, Reveal } from "./Reveal";
import { LOOP } from "@/config/motion";

/**
 * ULTRA VISION — en-tete des pages interieures.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/components/PageHero.tsx
 *  L'interface publique ne change pas : { eyebrow, title, intro }.
 *  Une option est ajoutee : { accent }.
 * ============================================================
 *
 * CE QUI CHANGE
 *
 * L'ancienne version posait un halo bleu flou en haut a gauche et
 * s'arretait la. Trois problemes.
 *
 * 1. AUCUN LIEN AVEC LA MARQUE. Une tache floue bleue est le decor le
 *    plus repandu du web. L'iris, lui, n'appartient qu'a vous.
 *
 * 2. AUCUNE HIERARCHIE DANS LE TITRE. Tout etait de la meme couleur,
 *    sur un titre pouvant atteindre 5 rem. Le regard n'avait aucun
 *    point d'entree. La prop `accent` permet desormais de mettre un
 *    fragment en bleu — le meme geste que sur la page d'accueil, ce
 *    qui fait que les pages se reconnaissent entre elles.
 *
 * 3. UNE SEULE ANIMATION POUR TOUT LE BLOC. L'eyebrow, le titre et le
 *    paragraphe apparaissaient ensemble, d'un seul mouvement. Ils
 *    entrent maintenant l'un apres l'autre, et le titre monte par
 *    masque comme celui de l'accueil.
 *
 * LE FILET BLEU SOUS L'EYEBROW
 *
 * Il se trace de gauche a droite a l'arrivee. C'est le meme geste que
 * le soulignement de la navigation et que la barre de progression :
 * trois endroits differents, un seul vocabulaire.
 */

export function PageHero({
  eyebrow,
  title,
  intro,
  /**
   * Fragment du titre a mettre en bleu. Doit correspondre exactement a
   * un morceau de `title`. Laisse vide pour un titre monochrome.
   */
  accent,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  accent?: string;
}) {
  /*
    Le titre est decoupe autour du fragment accentue. On ne fait aucune
    recherche approximative : si le fragment n'est pas trouve tel quel,
    le titre s'affiche entier, sans couleur. Une mise en forme ratee
    doit degrader vers du texte correct, jamais vers du texte casse.
  */
  const at = accent ? title.indexOf(accent) : -1;
  const before = at >= 0 ? title.slice(0, at) : title;
  const after = at >= 0 ? title.slice(at + (accent?.length ?? 0)) : "";

  return (
    <section className="relative overflow-hidden">
      {/* --- L'iris, coupe par le bord droit --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] select-none md:block"
      >
        <style>{`
          @keyframes uv-ph-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          .uv-ph-iris { animation: uv-ph-spin ${LOOP.iris}s linear infinite; }
          @keyframes uv-ph-line { from { transform: scaleX(0) } to { transform: scaleX(1) } }
          .uv-ph-line { animation: uv-ph-line 900ms cubic-bezier(.16,1,.3,1) 260ms both; transform-origin: left; }
          @media (prefers-reduced-motion: reduce) {
            .uv-ph-iris { animation: none }
            .uv-ph-line { animation: none; transform: scaleX(1) }
          }
        `}</style>

        <img
          src="/brand/icon/ultravision-icon-blue.svg"
          alt=""
          className="uv-ph-iris absolute top-1/2 right-[-26%] w-[min(72vh,620px)] -translate-y-1/2 opacity-[0.4]"
          draggable={false}
        />

        {/* Voile : le texte passe toujours devant. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #090909 20%, rgba(9,9,9,.76) 52%, rgba(9,9,9,0) 92%)",
          }}
        />
      </div>

      {/* --- Nappe bleue basse, tres diffuse --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background:
            "radial-gradient(70% 100% at 22% 130%, rgba(59,130,246,.22) 0%, transparent 68%)",
          filter: "blur(40px)",
        }}
      />

      <div className="shell relative pt-36 pb-16 lg:pt-44 lg:pb-20">
        <Reveal>
          <div className="inline-block">
            <p className="eyebrow" style={{ color: "#60A5FA" }}>
              {eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="uv-ph-line mt-2 block h-px w-full rounded-full"
              style={{ background: "linear-gradient(90deg, #3B82F6, transparent)" }}
            />
          </div>
        </Reveal>

        <h1 className="display mt-7 max-w-4xl text-[2.2rem] leading-[1.02] tracking-[-0.035em] sm:text-[3rem] lg:text-[3.8rem]">
          <MaskReveal delay={80}>
            {before}
            {at >= 0 && (
              <span
                style={{
                  background:
                    "linear-gradient(96deg, #60A5FA 0%, #3B82F6 48%, #1D4ED8 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {accent}
              </span>
            )}
            {after}
          </MaskReveal>
        </h1>

        <Reveal delay={280}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
