---
version: 1
slug: "src-components-public-app-programmeapp-tsx"
primary_target: "src/components/public/app/ProgrammeApp.tsx"
related_targets: ["src/components/public/app/LotPanel.tsx","src/components/public/LotSheet.tsx","src/components/public/LotDetails.tsx","src/components/public/OrbitViewer.tsx"]
---

# Page publique d'un programme (application)

Scope: `src/components/public/app/**`, la vue 3D, la fiche d'un lot. Visitor mode: Experience (la résidence mène), avec une action : demander une visite.

Audience: acheteurs sur téléphone, arrivés par un lien WhatsApp, Instagram ou une publicité. Job: trouver une villa libre qui leur convient, comprendre le prix et le paiement, demander une visite. Content: vue 3D qui tourne avec lots cliquables, lots et statuts en direct, photos, plans, visite 360°, quartier. Constraints: noir et champagne (couleur de marque du promoteur), FR + EN, logo REV visible, aucun effet piloté par le défilement, images jamais retouchées, prix parfois « sur demande ».

Chosen direction: « Je cherche » (choisi par le propriétaire le 2026-11-13, construction directe sans maquette en image).

## Direction contract

THESIS: La page est une phrase que l'acheteur complète, « Je cherche une villa… », et la résidence répond en allumant les villas qui conviennent. Elle refuse la page brochure de la catégorie : grande photo, tableau des lots, formulaire tout en bas.

OWN-WORLD: fond presque noir, surfaces à peine relevées, filets blancs à 10 %. La couleur du promoteur (champagne chez REV) ne sert qu'à ce qui est disponible et à l'action principale ; ambre pour réservé, graphite pour vendu. Police de marque du promoteur pour les noms et les grands numéros de lot ; Inter pour l'interface. Composants : la phrase à trous (mots soulignés qui ouvrent un choix), les lots en lignes de registre (numéro, faits, prix à droite, point de statut), angles de 10 px, pastilles réservées aux statuts.

STORY: l'acheteur voit la résidence arriver, lit la phrase, touche un mot, voit les villas s'allumer et le compte changer, ouvre une villa, lit le prix et l'échéancier, demande une visite depuis la barre toujours présente.

FIRST VIEWPORT: téléphone 390 × 844. Barre du haut de 52 px : nom du programme à gauche, FR / EN à droite. Dessous, la vue 3D cadrée sur les villas, pleine largeur, environ 300 px, sans bandes. Puis la phrase sur deux lignes à 20 px avec ses mots soulignés et le compte « 14 villas disponibles ». Puis les deux premières lignes de résultat. Barre fixe en bas de 64 px : « Planifier une visite » en couleur de marque, et WhatsApp. Ordinateur : la vue remplit la gauche, la phrase et les résultats tiennent dans une colonne de 440 px à droite.

FORM: « Recherche d'abord », 4e de la liste ordonnée de 7 structures ; seed key 1d8aaf19. Interaction signature : choisir un mot de la phrase allume les villas correspondantes sur la vue 3D et réordonne la liste ; mouvement en 180 à 240 ms, sortie douce, le compte se fond d'une valeur à l'autre.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
