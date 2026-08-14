import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EASE_ENTER, MOTION } from '@/config/motion'

/**
 * ULTRA VISION — apparition au scroll.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/components/Reveal.tsx
 *  L'interface publique est identique a l'ancienne version :
 *  { children, delay, className }. Aucun autre fichier du site
 *  n'a besoin d'etre modifie. Tous les <Reveal> deja en place
 *  sont repares d'un coup.
 * ============================================================
 *
 * LE BUG QUI EST CORRIGE ICI
 *
 * Verifie sur le site en production le 11 aout 2026 : le titre
 * « FAQ / Questions frequentes » reste a `opacity: 0` alors que
 * l'element est visible a 100 % dans l'ecran depuis plus de trois
 * secondes. Meme symptome ailleurs dans la page.
 *
 * Cause : l'ancienne version reposait uniquement sur un
 * IntersectionObserver. Or un IntersectionObserver ne se declenche
 * que sur un CHANGEMENT d'etat. Le site etant rendu cote serveur
 * (TanStack Start), il arrive que l'observateur soit branche avant
 * que la mise en page finale ne soit calculee : il mesure alors un
 * element de hauteur nulle, conclut « pas visible », et ne se
 * redeclenche jamais puisque le visiteur ne scrolle plus. Le
 * contenu reste invisible pour toujours.
 *
 * TROIS PARADES, CUMULATIVES
 *
 * 1. Verification manuelle de la position au montage. Si l'element
 *    est deja dans l'ecran, on affiche sans attendre l'observateur.
 * 2. Seuil de declenchement bas et marge negative reduite.
 * 3. Filet de securite temporise : passe 2,5 secondes, le contenu
 *    s'affiche quoi qu'il arrive.
 *
 * REGLE : une animation qui echoue doit degrader vers du contenu
 * visible, jamais vers du vide.
 *
 * En bonus, `prefers-reduced-motion` est desormais respecte : les
 * visiteurs qui ont demande moins d'animations voient le contenu
 * immediatement, sans transition.
 */

/*
  Les durees et les courbes viennent de src/config/motion.ts.

  L'APPARITION RETENUE, ET POURQUOI ELLE A TROIS COMPOSANTES

  1. Une montee de 26 px. Seule, elle donne un glissement plat.
  2. Une mise a l'echelle de 0,975 a 1. Infime — 2,5 % — mais c'est elle
     qui fait que le bloc semble AVANCER vers le visiteur au lieu de
     simplement monter. C'est la composante que l'on ne voit pas et dont
     l'absence se sent.
  3. Un flou de 6 px qui se dissipe, et plus vite que le reste : il doit
     avoir disparu avant la fin du mouvement, sinon le texte reste
     illisible pendant qu'il bouge encore.

  Les trois ensemble donnent une entree de camera. Prises une par une,
  aucune ne produit cet effet.
*/
const EASE = EASE_ENTER

function useIsVisible<T extends HTMLElement>(safetyMs = 2500) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    // Parade 1 : l'element est-il deja a l'ecran ?
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0 && rect.height > 0) {
      setShown(true)
      return
    }

    // Parade 2 : observateur permissif.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el)

    // Parade 3 : filet de securite.
    const timer = window.setTimeout(() => {
      setShown(true)
      io.disconnect()
    }, safetyMs)

    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [safetyMs])

  return { ref, shown }
}

/**
 * Bloc qui monte et se revele.
 * `delay` est exprime en millisecondes, comme dans la version precedente.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, shown } = useIsVisible<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0) scale(1)' : 'translateY(26px) scale(.975)',
        filter: shown ? 'blur(0px)' : 'blur(6px)',
        transition: [
          `opacity ${MOTION.enter}ms ${EASE} ${delay}ms`,
          `transform ${MOTION.enter}ms ${EASE} ${delay}ms`,
          // Le flou se leve en avance : le texte doit redevenir net
          // pendant qu'il finit de monter, pas apres.
          `filter ${Math.round(MOTION.enter * 0.78)}ms ease-out ${delay}ms`,
        ].join(', '),
        willChange: shown ? 'auto' : 'transform, opacity, filter',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Revelation par masque, pour les grands titres.
 *
 * Le texte part de 110 % vers le bas a l'interieur d'un conteneur qui
 * coupe ce qui depasse, puis remonte a sa place. Le texte semble emerger
 * d'une fente. C'est ce mouvement qui distingue un titre editorial haut
 * de gamme d'un simple fondu.
 *
 * A reserver aux titres. Sur un paragraphe, l'effet devient lourd.
 */
export function MaskReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, shown } = useIsVisible<HTMLSpanElement>()

  return (
    <span
      ref={ref}
      className="block overflow-hidden"
      style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
    >
      <span
        className={`block ${className}`}
        style={{
          transform: shown ? 'translateY(0%)' : 'translateY(110%)',
          transition: `transform ${MOTION.enterTitle}ms ${EASE} ${delay}ms`,
        }}
      >
        {children}
      </span>
    </span>
  )
}

/**
 * Apparition en cascade : chaque enfant direct entre a son tour.
 * `stagger` est l'ecart entre deux enfants, en millisecondes.
 */
export function RevealGroup({
  children,
  stagger = MOTION.stagger,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  stagger?: number
  delay?: number
  className?: string
}) {
  const { ref, shown } = useIsVisible<HTMLDivElement>()
  const items = Array.isArray(children) ? children : [children]

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'translateY(0) scale(1)' : 'translateY(22px) scale(.982)',
            filter: shown ? 'blur(0px)' : 'blur(5px)',
            transition: [
              `opacity ${MOTION.enter}ms ${EASE} ${delay + i * stagger}ms`,
              `transform ${MOTION.enter}ms ${EASE} ${delay + i * stagger}ms`,
              `filter ${Math.round(MOTION.enter * 0.78)}ms ease-out ${delay + i * stagger}ms`,
            ].join(', '),
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
