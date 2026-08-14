/**
 * ULTRA VISION — adresse du site.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/config/site.ts
 *
 *  UNE SEULE LIGNE A CHANGER LE JOUR DU BASCULEMENT.
 * ============================================================
 *
 * POURQUOI CE FICHIER EXISTE
 *
 * L'adresse etait ecrite en dur dans les dix pages du site, sous la
 * forme `const URL = "https://timeless-brand-engine.lovable.app"`.
 *
 * Ce n'est pas un detail cosmetique : cette adresse alimente les
 * adresses canoniques, les balises Open Graph et TOUTES les donnees
 * structurees. En oublier une seule au moment du changement produit
 * une page qui declare a Google appartenir a un autre site que celui
 * ou elle se trouve — et Google traite ce cas en cessant d'indexer la
 * page.
 *
 * Desormais tout passe par ici. Le jour du basculement, tu modifies
 * `SITE_URL` et les dix pages suivent.
 *
 * ------------------------------------------------------------
 *  MODE D'EMPLOI DU BASCULEMENT
 *
 *  1. Connecte le domaine dans Lovable et attends que le certificat
 *     de securite soit actif — l'adresse doit s'ouvrir en https sans
 *     avertissement du navigateur.
 *
 *  2. SEULEMENT ENSUITE, remplace la valeur ci-dessous et redeploie.
 *
 *  L'ordre compte. Si tu changes cette ligne avant que le domaine ne
 *  reponde, le site declare a Google une adresse qui n'existe pas
 *  encore, et tu perds ton referencement le temps que ca se repare.
 * ------------------------------------------------------------
 */

/**
 * Adresse publique du site, SANS barre oblique finale.
 *
 * Le jour du basculement :
 *   export const SITE_URL = "https://ultravisionagency.com";
 */
export const SITE_URL = "https://timeless-brand-engine.lovable.app";

/** Nom du domaine seul, sans protocole. Sert aux affichages. */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

/**
 * Construit une adresse absolue a partir d'un chemin.
 * `url("/tarifs")` -> "https://…/tarifs"
 *
 * La barre oblique de debut est ajoutee si elle manque, et une
 * eventuelle barre finale de SITE_URL est retiree : deux adresses qui
 * ne different que par une barre sont deux pages differentes pour
 * Google, et c'est une source classique de contenu duplique.
 */
export const url = (path = "") => {
  const base = SITE_URL.replace(/\/+$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
