import { Link } from '@tanstack/react-router'
import { FEATURED_WORK, type WorkItem } from './work.data'
import { WorkRibbon } from './WorkRibbon'
import { MaskReveal, Reveal } from '@/components/Reveal'
import { Texture } from '@/components/Texture'

/**
 * ULTRA VISION — section « Selected Work ».
 *
 * POSITION DANS LA PAGE
 * Cette section se place immediatement apres le Hero, AVANT le bandeau de
 * logos clients. C'est le point le plus important de tout le projet : le
 * visiteur doit voir une realisation des le premier scroll, pas apres avoir
 * traverse trois blocs de texte.
 *
 * Ordre voulu sur la page d'accueil :
 *   Hero -> VideoShowcase -> logos clients -> expertises -> methode -> ...
 *
 * RYTHME
 * Quatre realisations sur l'accueil, pas davantage. Au dela, la page devient
 * un catalogue et perd sa tension. Les autres vivent sur /realisations.
 */

type Props = {
  items?: WorkItem[]
  /** Titre de section. */
  title?: string
  label?: string
  intro?: string
  /** Affiche le lien vers la page complete. */
  withLink?: boolean
  className?: string
}

export function VideoShowcase({
  items = FEATURED_WORK,
  label = 'SELECTED WORK',
  title = 'Ce que nous produisons.',
  intro = 'Films de marque, campagnes publicitaires et contenus performants. Produits en interne, de l ecriture au montage final.',
  withLink = true,
  className = '',
}: Props) {
  return (
    <section
      aria-labelledby="selected-work-title"
      /*
        L'ECART AVEC LA SECTION DU DESSUS EST DIVISE PAR DEUX.

        La marge haute passe de 96 px a 40 px, la marge basse reste
        genereuse. Auparavant les deux etaient identiques : le titre
        flottait au milieu de deux vides egaux, sans appartenir a rien.

        Un titre doit etre proche de ce qu'il annonce et distant de ce
        qui precede. C'est cette dissymetrie qui fait qu'on lit une
        suite plutot que deux blocs sans rapport.
      */
      className={`relative overflow-hidden pt-10 pb-24 sm:pt-12 sm:pb-28 lg:pt-14 lg:pb-32 ${className}`}
      style={{
        // Jamais un aplat. Le fond glisse de #0b0b0b a #070707 : l'ecart
        // est presque imperceptible, mais il suffit pour que l'oeil cesse
        // de lire un trou et se mette a lire une profondeur.
        background: 'linear-gradient(to bottom, #0b0b0c 0%, #090909 42%, #070708 100%)',
      }}
    >
      {/* Grille technique : elle donne une echelle a l'espace vide. */}
      <Texture tone="dark" size={80} opacity={0.05} from="70% 12%" />

      {/*
        L'ancien halo bleu en haut a droite est retire.

        Le ruban porte desormais son propre contre-jour, centre sur la
        hauteur des cartes. Deux sources bleues dans la meme section se
        contredisent : l'oeil ne sait plus d'ou vient la lumiere, et le
        lisere froid sur les aretes des cartes — qui n'a de sens que
        s'il vient de derriere — devient incoherent.
      */}

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* ---------- En-tete de section ---------- */}
        <header className="mb-7 sm:mb-8">
          <Reveal>
            <div className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]"
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A8A8A]">
                {label}
              </span>
            </div>
          </Reveal>

          {/*
            LE TITRE PASSE DE 5,5 rem A 2 rem AU MAXIMUM.

            A `clamp(2.5rem, 7vw, 5.5rem)` il atteignait la taille du
            titre du hero. Deux consequences, toutes deux mauvaises.

            La premiere est hierarchique : deux titres de meme poids sur
            une meme page, c'est une page sans hierarchie. Le visiteur ne
            sait plus lequel compte.

            La seconde est plus grave ici : le sujet de ce bloc, ce sont
            les images. Un titre de cette taille les ecrase et retarde le
            moment ou l'oeil les atteint. Une entree de section annonce ;
            elle ne doit pas concurrencer ce qu'elle annonce.
          */}
          <h2
            id="selected-work-title"
            className="font-display mt-3 max-w-2xl text-[clamp(1.5rem,3vw,2rem)] leading-[1.05] tracking-[-0.03em] text-[#F5F5F3]"
          >
            <MaskReveal delay={80}>{title}</MaskReveal>
          </h2>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Reveal delay={160}>
              <p className="max-w-lg text-[14px] leading-relaxed text-[#8A8A8A] sm:text-[15px]">
                {intro}
              </p>
            </Reveal>

            {withLink && (
              <Reveal delay={220}>
                <Link
                  to="/realisations"
                  className="group inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#F5F5F3] outline-none transition-colors duration-300 hover:text-[#60A5FA] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-4 focus-visible:ring-offset-[#090909]"
                >
                  Voir toutes les realisations
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </Reveal>
            )}
          </div>
        </header>

        {/* ---------- Les realisations ---------- */}
        <WorkRibbon items={items} />
      </div>
    </section>
  )
}

export default VideoShowcase
