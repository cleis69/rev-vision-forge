---
version: 1
slug: "src-components-pages-salesplanpage-tsx"
primary_target: "src/components/pages/SalesPlanPage.tsx"
related_targets: ["src/components/rev/SalesPlanDemo.tsx"]
---

# Page de l'offre « Plan de vente 3D » (site REV)

Scope: `/plan-de-vente-3d` et `/en/3d-sales-plan` : `src/components/pages/SalesPlanPage.tsx` et la démo `src/components/rev/SalesPlanDemo.tsx`. Visitor mode: Persuade. Action : réserver une démo (WhatsApp), ou essayer la démo comme un acheteur.

Audience: promoteurs et directeurs commerciaux au Maroc, souvent sur téléphone depuis un lien ou une publicité, parfois sur ordinateur au bureau. Job: comprendre en quelques secondes ce que l'outil fait de plus qu'une maquette ou une brochure, le toucher, puis prendre rendez-vous. Content: textes FR/EN existants (fonctions acheteur, équipe, studio, mise en route, FAQ), la démo fictive « Villas de démonstration ». Constraints: DA du site (#090909, champagne #C8A96A, Space Grotesk / Inter), aucun nom de client ni de concurrent, aucun nom d'outil de production, aucun effet piloté par le défilement, mises en page compactes, logo REV visible, pas de témoignage ni de chiffre inventé ; échéancier, rentabilité et alertes ne sont annoncés qu'une fois la migration appliquée.

Chosen direction: « La fiche technique » (tirage 5cbbfb6a, structure en tête ; construction directe, sans maquette en image, demandée par le propriétaire).

## Direction contract

THESIS: La page est la fiche technique du produit, posée à côté du produit lui-même : la vraie démo dans un téléphone, puis chaque fonction sur une ligne de registre, par public. Elle refuse la page SaaS de la catégorie : sur-titres, grilles de cartes icône + titre + texte, chiffres héros, halos.

OWN-WORLD: fond #090909, filets à 10 %, aucune carte ; champagne seulement pour l'action principale, le mot accentué d'un titre et ce que fait REV ; gris pour ce que font la maquette et la brochure. Space Grotesk pour les titres et le nom de chaque fonction, Inter pour le reste. Lignes de registre à trois colonnes (fonction, ce que REV fait, ce que font les autres), angles de 10 px, aucune pastille hors statuts.

STORY: le promoteur lit la promesse, voit la page d'un programme vivre dans un téléphone, la lance, puis parcourt la fiche : ce que voit l'acheteur, ce que fait son équipe, ce que produit le studio, ce qu'il envoie. Il réserve une démo.

FIRST VIEWPORT: ordinateur 1440 × 900 : à gauche le titre sur trois lignes (clamp jusqu'à 60 px), le texte, « Réserver une démo » en champagne et « Essayer la démo », une ligne de trois faits ; à droite le téléphone de 340 × 700 avec la capture réelle de la démo et « Essayer comme un acheteur » ; un clic charge la vraie page dans le téléphone. Téléphone 390 : titre, texte, les deux actions pleine largeur, puis la capture dans un cadre qui ouvre la démo.

FORM: « La fiche technique », 5e de la liste ordonnée de 7 structures ; seed key 5cbbfb6a. Moment signature : la capture se fond dans la page vivante quand on lance la démo, dans le même cadre, sans saut.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Provenance des images

- `src/assets/demo-phone-390.webp`, `demo-phone-780.webp` : capture d'écran de la page publique de la démo fictive (realestatevision360.com/p/villas-de-demonstration), téléphone 390 × 844 à 2×, prise le 2026-11-13, convertie en WebP qualité 84. Aucune image client.
