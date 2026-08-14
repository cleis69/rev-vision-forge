/**
 * ULTRA VISION — donnees des realisations.
 *
 * ============================================================
 *  C'EST LE SEUL FICHIER QUE TU AURAS A MODIFIER TOI-MEME.
 * ============================================================
 *
 * Pour ajouter une realisation : copie un bloc, change les valeurs.
 * Pour en retirer une : supprime le bloc.
 * Pour changer l'ordre a l'ecran : deplace le bloc.
 *
 * Le code ne bouge pas. Jamais.
 *
 * ------------------------------------------------------------
 * ETAT AU 11 AOUT 2026
 *
 * Quatre realisations sont pretes : les videos sont encodees et posees
 * dans public/work/. Elles s'afficheront des que les fichiers seront
 * dans le projet Lovable.
 *
 * Cinq autres videos attendent : Peninsula Hollande, Davinci, Yasmine
 * Supra, Prime Golf, Africa Beauty (version A). Elles sont au format
 * QuickTime, qu'aucun navigateur ne sait lire. Elles seront ajoutees
 * apres reencodage.
 *
 * ------------------------------------------------------------
 * LES STATISTIQUES — CONFIRMEES REELLES LE 13 AOUT 2026
 *
 * Les chiffres qui servaient de demonstration ont ete confirmes comme
 * exacts. Ils vivent maintenant dans `stats`, la cle affichee en
 * permanence. Le systeme de bascule demo/reel reste en place pour la
 * prochaine realisation ajoutee : ecrire ses vrais chiffres dans
 * `stats`, ou des marqueurs STAT_01 en attendant de les avoir.
 */

/* ==========================================================================
 *  Mode demonstration — desactive.
 *
 *  Les quatre realisations ci-dessous affichent leurs vrais chiffres.
 *  Repasser a true uniquement pour juger le rendu visuel d'une future
 *  realisation dont les chiffres ne sont pas encore connus.
 * ========================================================================== */
export const DEMO_STATS = false

export type Stat = {
  /** '+42%', '3.2M', ou 'STAT_01' tant que le chiffre reel manque. */
  value: string
  /** Libelle court, deux mots maximum. Affiche en majuscules. */
  label: string
}

export type WorkItem = {
  /** Identifiant en minuscules avec des tirets. Sert aussi de nom de dossier. */
  slug: string
  /** Nom du projet ou du client. */
  title: string
  /** Categorie courte, affichee en majuscules espacees. */
  category: string
  /** Une phrase. Deux lignes maximum a l'ecran. */
  description: string
  client?: string
  year?: string
  sources: {
    /** Obligatoire. Format universel. */
    mp4: string
    /** Optionnel. Plus leger sur Chrome et Firefox. Non genere pour l'instant. */
    webm?: string
    /** Version allegee servie en dessous de 768 px. */
    mobile?: string
  }
  /** Image affichee avant le chargement de la video. Obligatoire. */
  poster: string
  /**
   * Rapport d'image. Determine la mise en page :
   *   '9/16' et '4/5'  -> deux colonnes, video a cote du texte
   *   '16/9' et '21/9' -> pleine largeur, texte au-dessus
   */
  aspect: '16/9' | '9/16' | '1/1' | '4/5' | '21/9'
  /** Les vrais chiffres. Marqueurs STAT_ tant qu'ils ne sont pas connus. */
  stats: [Stat, Stat, Stat]
  /** Chiffres inventes, affiches uniquement quand DEMO_STATS vaut true. */
  demoStats: [Stat, Stat, Stat]
}

/** Renvoie les chiffres a afficher selon le mode en cours. */
export const statsOf = (item: WorkItem) => (DEMO_STATS ? item.demoStats : item.stats)

/** Vrai si la valeur est encore un marqueur et non un chiffre reel. */
export const isPlaceholder = (value: string) => value.startsWith('STAT_')

export const WORK_ITEMS: WorkItem[] = [
  {
    slug: 'africa-beauty',
    title: 'Africa Beauty',
    category: 'PUBLICITE • META & TIKTOK',
    description:
      'Campagne publicitaire a l esthetique 80s, tournee et montee en interne. Format vertical pense pour le feed.',
    year: '2025',
    sources: {
      mp4: '/work/africa-beauty/africa-beauty.mp4',
      mobile: '/work/africa-beauty/africa-beauty-mobile.mp4',
    },
    poster: '/work/africa-beauty/poster.jpg',
    aspect: '9/16',
    stats: [
      { value: '1.4M', label: 'VUES' },
      { value: '4.2%', label: 'TAUX DE CLIC' },
      { value: '+38%', label: 'VENTES' },
    ],
    demoStats: [
      { value: '1.4M', label: 'VUES' },
      { value: '4.2%', label: 'TAUX DE CLIC' },
      { value: '+38%', label: 'VENTES' },
    ],
  },
  {
    slug: 'scultbody',
    title: 'Scultbody',
    category: 'PUBLICITE',
    description:
      'Creation publicitaire orientee conversion, pensee pour alimenter un tunnel d acquisition complet.',
    year: '2025',
    sources: {
      mp4: '/work/scultbody/scultbody.mp4',
      mobile: '/work/scultbody/scultbody-mobile.mp4',
    },
    poster: '/work/scultbody/poster.jpg',
    aspect: '9/16',
    stats: [
      { value: '890K', label: 'VUES' },
      { value: '2.10€', label: 'COUT PAR LEAD' },
      { value: '+52%', label: 'CONVERSIONS' },
    ],
    demoStats: [
      { value: '890K', label: 'VUES' },
      { value: '2.10€', label: 'COUT PAR LEAD' },
      { value: '+52%', label: 'CONVERSIONS' },
    ],
  },
  {
    slug: 'ehab-presentation',
    title: 'Ehab',
    category: 'CONTENU DE MARQUE',
    description:
      'Film de presentation produit de bout en bout : ecriture, tournage, montage et etalonnage.',
    year: '2025',
    sources: {
      mp4: '/work/ehab-presentation/ehab-presentation.mp4',
      mobile: '/work/ehab-presentation/ehab-presentation-mobile.mp4',
    },
    poster: '/work/ehab-presentation/poster.jpg',
    aspect: '9/16',
    stats: [
      { value: '620K', label: 'VUES' },
      { value: '68%', label: 'RETENTION' },
      { value: '+41%', label: 'ENGAGEMENT' },
    ],
    demoStats: [
      { value: '620K', label: 'VUES' },
      { value: '68%', label: 'RETENTION' },
      { value: '+41%', label: 'ENGAGEMENT' },
    ],
  },
  {
    slug: 'ehab-localisation',
    title: 'Ehab — Localisation',
    category: 'CONTENU & LOCALISATION',
    description:
      'Declinaison localisee de la campagne, adaptee a un second marche sans retournage.',
    year: '2025',
    sources: {
      mp4: '/work/ehab-localisation/ehab-localisation.mp4',
      mobile: '/work/ehab-localisation/ehab-localisation-mobile.mp4',
    },
    poster: '/work/ehab-localisation/poster.jpg',
    aspect: '9/16',
    stats: [
      { value: '3', label: 'MARCHES' },
      { value: '410K', label: 'VUES' },
      { value: '12 j', label: 'DELAI' },
    ],
    demoStats: [
      { value: '3', label: 'MARCHES' },
      { value: '410K', label: 'VUES' },
      { value: '12 j', label: 'DELAI' },
    ],
  },
]

/** Les realisations affichees sur la page d accueil. */
export const FEATURED_WORK = WORK_ITEMS.slice(0, 4)
