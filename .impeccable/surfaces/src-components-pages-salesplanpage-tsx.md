---
version: 1
slug: "src-components-pages-salesplanpage-tsx"
primary_target: "src/components/pages/SalesPlanPage.tsx"
related_targets: ["src/components/rev/SalesPlanDemo.tsx","src/components/rev/SalesPlanScenes.tsx"]
---

# Page de l'offre « Plan de vente 3D » (site REV)

Scope: `/plan-de-vente-3d` et `/en/3d-sales-plan` : `src/components/pages/SalesPlanPage.tsx`, le téléphone `src/components/rev/SalesPlanDemo.tsx`, les scènes `src/components/rev/SalesPlanScenes.tsx`. Visitor mode: Persuade. Action : demander une démo sur WhatsApp, ou ouvrir la démo.

Audience: promoteurs et directeurs commerciaux au Maroc, souvent sur téléphone depuis un lien ou une publicité, parfois sur ordinateur au bureau. Job: comprendre en quelques secondes ce que l'outil fait de plus qu'une maquette ou une brochure, le voir marcher, puis prendre rendez-vous. Content: textes FR/EN existants, la démo fictive « Villas de démonstration ». Constraints: noir #090909 et champagne #C8A96A, Space Grotesk / Inter, aucun nom de client ni de concurrent, aucun nom d'outil de production, aucun effet lié au défilement, mises en page compactes, logo REV visible, pas de témoignage ni de chiffre inventé ; échéancier, rentabilité et alertes ne sont annoncés qu'une fois la migration appliquée.

Chosen direction: « La fiche technique », revue le 2026-11-15 après le retour du propriétaire (« la présentation de Lumina est beaucoup mieux et leurs animations aussi ») : le produit est montré en marche sur des scènes champagne. Skill unslop appliqué en plus à la demande du propriétaire.

Direction (unslop) : Product — REV fabrique la 3D d'un programme immobilier et fournit la page qui le vend : lots en direct, fiche, visite, demande. Character — précis, nocturne, sûr de lui. World — le bureau de vente le soir : la maquette éclairée, le laiton, le papier des plans. Moments — le produit filmé sur une scène champagne (téléphone du héros, scènes de l'acheteur). Signature — la ligne de registre (nom, faits) et le point de statut à trois couleurs.

## Direction contract

THESIS: La page montre le produit qui marche, posé sur du champagne, puis sa fiche technique ligne par ligne. Elle refuse la page SaaS de la catégorie : sur-titres, grilles de cartes icône + titre + texte, chiffres héros, halos, et la capture d'écran figée.

OWN-WORLD: fond #090909, filets à 10 %, aucune carte d'argumentaire. Le champagne est une surface : la scène qui porte le produit (héros, scènes de l'acheteur, espace promoteur) et le bandeau final ; ailleurs il marque l'action principale, la phrase accentuée d'un titre et ce qui appartient à REV dans la fiche (l'en-tête « Avec REV », « Nouveau », « Vous recevez », les chiffres 1 à 3 et les coches). Space Grotesk pour les titres et le nom de chaque fonction, Inter pour le reste. Lignes de registre, angles de 10 px (14 px pour une scène), aucune pastille hors statuts, aucun libellé en capitales.

STORY: le promoteur lit la promesse, voit la page d'un programme utilisée dans un téléphone, puis regarde cinq scènes de ce que fait l'acheteur (chercher, ouvrir une fiche, changer de vue, comparer, demander une visite), parcourt la fiche face à la maquette et à la brochure, voit une illustration fidèle de son espace (liste des lots, menu de statut, demande qui arrive), et demande une démo.

FIRST VIEWPORT: ordinateur 1440 × 900 : à gauche le titre sur trois lignes (jusqu'à 60 px), le texte, « Demander une démo sur WhatsApp » en champagne et « Ouvrir la démo », rien d'autre sous les deux actions ; à droite une scène champagne de 400 × 725 avec un téléphone noir qui joue le film de la démo. Téléphone 390 : titre, texte, deux actions pleine largeur, puis la scène champagne bord à bord avec le téléphone.

FORM: « La fiche technique », 5e de la liste ordonnée de 7 structures ; seed key 5cbbfb6a. Moment signature : les cinq scènes filmées se suivent sur la scène champagne, la ligne de la scène en cours se remplit (lignes sur ordinateur, rail sur téléphone), et l'on peut choisir une scène. Tirage du 2026-11-13 (sortie du script dans la transcription de la session).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Provenance des images et des films

- `src/assets/demo-phone-390.webp`, `demo-phone-780.webp` : page de la démo fictive (Villas de démonstration) au repos, téléphone 390 × 844 à 2×, 2026-11-15 (après le passage des libellés en bas de casse).
- `src/assets/demo-desktop-960.webp`, `demo-desktop-1440.webp` : la même page au repos sur ordinateur (1280 × 800 à 1,5×), 2026-11-15.
- `src/assets/demo-phone-film.mp4` : film de la démo fictive utilisée sur téléphone, retourné le 2026-11-15 en pleine densité (scénario `scenes/hero.mjs`).
- `src/assets/scenes/d-*.mp4` (1280 × 800 à 1,5×) et `m-*.mp4` (390 × 844 à 2×) : cinq scènes filmées de la démo fictive servie en local, retournées le 2026-11-15 en pleine densité après le nettoyage des libellés, avec `.impeccable/review/tools/film.mjs` et les scénarios de `.impeccable/review/tools/scenes/`. Les demandes et les visites sont bloquées pendant le tournage ; le nom et le numéro saisis dans la scène « contacter » sont inventés.
- `work-interior`, `work-matterport`, `work-drone` : photos déjà présentes sur le site (page Expertises).
- Aucune image de client.

## Points ouverts

- Le champagne rendu par `--primary` (≈ #C2A880) n'est pas le #C8A96A annoncé : choix demandé au propriétaire (image de comparaison envoyée le 2026-11-15).
- « un clic » : dans l'espace promoteur, changer un statut demande deux clics (ouvrir le menu, choisir). L'illustration montre le vrai geste ; le texte est laissé au propriétaire.
- L'illustration de l'espace promoteur est dessinée (pas filmée) : la session sans interface ne peut pas se connecter à l'espace.
