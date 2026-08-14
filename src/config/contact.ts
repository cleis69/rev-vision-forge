/**
 * ULTRA VISION — coordonnees de contact.
 *
 * ============================================================
 *  TOUTES LES COORDONNEES DU SITE SONT ICI, ET NULLE PART AILLEURS.
 * ============================================================
 *
 * Avant, le faux numero +33 6 00 00 00 00 etait ecrit en dur a
 * quatre endroits differents : deux liens telephone, deux liens
 * WhatsApp. Le changer voulait dire les retrouver un par un, avec
 * le risque d'en oublier un.
 *
 * Maintenant tu modifies ce fichier, et tout le site suit.
 *
 * ------------------------------------------------------------
 * LE GARDE-FOU
 *
 * Tant que `phone` ou `whatsapp` sont vides, les boutons
 * correspondants ne s'affichent pas du tout.
 *
 * C'est volontaire. Un bouton WhatsApp qui ouvre une conversation
 * avec un numero inexistant est pire que pas de bouton : le
 * visiteur pense que tu es injoignable, et tu perds le contact
 * sans jamais le savoir.
 *
 * Des que tu renseignes un vrai numero, les boutons reapparaissent
 * automatiquement.
 */

export const CONTACT = {
  /** Adresse e-mail publique. */
  email: "contact@ultravisionagency.com",

  /**
   * Numero de telephone francais, au format international.
   *
   * ATTENTION : tu m'as donne "+330675627707". J'ai retire le zero.
   * En format international, le zero de debut disparait toujours :
   * le numero national 06 75 62 77 07 s'ecrit +33 675 62 77 07.
   * Avec le zero en trop, un appel depuis l'etranger echoue.
   * Si le numero exact est different, corrige ici.
   */
  phone: "+33675627707",

  /**
   * Numero WhatsApp, sans le plus ni les espaces.
   * Ici le numero marocain : +212 638 59 56 58.
   */
  whatsapp: "212638595658",

  /**
   * Message pre-rempli quand le visiteur ouvre WhatsApp.
   *
   * Il est ecrit du point de vue du visiteur, puisque c'est lui qui
   * l'envoie. Il precise d'ou vient le contact, ce qui te permet de
   * distinguer immediatement un lead du site d'un message personnel.
   * Court volontairement : un message trop long est efface avant
   * l'envoi, et le contexte se perd.
   */
  whatsappMessage:
    "Bonjour ULTRA VISION, je viens de votre site. J'aimerais echanger sur mon projet.",

  /** Villes affichees dans le pied de page. */
  locations: "Casablanca — Rabat — Marrakech — Tanger — Agadir",

  /**
   * Les memes villes, en liste, pour les donnees structurees.
   *
   * Elles doivent rester identiques a `locations` : Google compare ce
   * qui est balise et ce qui est affiche, et une divergence entre les
   * deux est traitee comme une tentative de manipulation.
   */
  cities: ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir"],

  /** Pays d'intervention, code ISO. Sert aux donnees structurees. */
  country: "MA",
  countryName: "Maroc",
} as const

/** Vrai si un numero de telephone publiable est renseigne. */
export const hasPhone = CONTACT.phone.length > 0

/** Vrai si un numero WhatsApp publiable est renseigne. */
export const hasWhatsapp = CONTACT.whatsapp.length > 0

/** Numero de telephone formate pour l'affichage : +33 6 12 34 56 78 */
export function phoneDisplay() {
  if (!hasPhone) return ""
  const n = CONTACT.phone.replace(/\s/g, "")
  if (n.startsWith("+33") && n.length === 12) {
    return `+33 ${n.slice(3, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)} ${n.slice(8, 10)} ${n.slice(10, 12)}`
  }
  return CONTACT.phone
}

/** Lien WhatsApp complet, avec le message pre-rempli. */
export function whatsappUrl() {
  if (!hasWhatsapp) return ""
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`
}

/** Lien mailto. */
export const mailtoUrl = `mailto:${CONTACT.email}`

/** Lien telephone. */
export const telUrl = hasPhone ? `tel:${CONTACT.phone}` : ""

/**
 * Zone d'intervention, au format attendu par les donnees structurees.
 *
 * A UTILISER SUR TOUTES LES PAGES, sans exception.
 *
 * Declarer une zone differente d'une page a l'autre est l'erreur la
 * plus courante et la plus couteuse en referencement local : Google
 * ne sait plus ou situer l'entreprise, et cesse de l'afficher partout.
 */
export const AREA_SERVED = [
  { "@type": "Country", name: CONTACT.countryName },
  ...CONTACT.cities.map((c) => ({ "@type": "City", name: c })),
]

/** Bloc Organization reutilisable dans toutes les donnees structurees. */
export const ORG_LD = (url: string) => ({
  "@type": "Organization",
  name: "ULTRA VISION",
  url,
  email: CONTACT.email,
  ...(hasPhone ? { telephone: CONTACT.phone } : {}),
  address: { "@type": "PostalAddress", addressCountry: CONTACT.country },
  areaServed: AREA_SERVED,
})
