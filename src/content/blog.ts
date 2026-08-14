/**
 * ULTRA VISION — les articles du blog.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/content/blog.ts
 *
 *  C'EST LE SEUL FICHIER A MODIFIER POUR ECRIRE UN ARTICLE.
 *  Les pages /blog et /blog/mon-article se construisent seules.
 * ============================================================
 *
 * POURQUOI UN BLOG SUR CE SITE, ET CE QU'IL DOIT FAIRE
 *
 * Un blog d'agence ne sert presque jamais a etre lu. Il sert a deux
 * choses tres concretes :
 *
 * 1. REPONDRE AVANT L'APPEL. Chaque article traite une objection que
 *    vous entendez au telephone. Un prospect qui a lu l'article arrive
 *    avec la question suivante, pas avec la premiere.
 *
 * 2. EXISTER SUR GOOGLE sur des recherches que personne ne fait sur
 *    votre nom : « combien coute une video publicitaire », « pourquoi
 *    mes publicites ne convertissent plus ». Ce sont des recherches de
 *    debut de parcours, et ce sont les seules ou vous pouvez apparaitre
 *    sans budget publicitaire.
 *
 * D'ou la regle qui gouverne ces textes : aucun article ne parle de
 * l'agence. Chacun resout un probleme, et l'agence apparait a la fin
 * comme une consequence, jamais comme un sujet.
 *
 * ------------------------------------------------------------
 * COMMENT AJOUTER UN ARTICLE
 *
 * Copie un bloc, change les valeurs. Le corps est une suite de blocs :
 *
 *   { k: 'h2',    v: 'Un intertitre' }
 *   { k: 'p',     v: 'Un paragraphe.' }
 *   { k: 'ul',    v: ['Premier point', 'Deuxieme point'] }
 *   { k: 'quote', v: 'Une phrase mise en exergue.' }
 *   { k: 'note',  v: 'Un encadre bleu, pour un point important.' }
 *   { k: 'table', v: { head: ['Col 1','Col 2'], rows: [['a','b']] } }
 *
 * Les dates sont au format AAAA-MM-JJ. L'ordre d'affichage suit la
 * date, du plus recent au plus ancien.
 * ------------------------------------------------------------
 */

import type { FigureData } from "@/components/Figure";

export type Block =
  | { k: "h2"; v: string }
  | { k: "p"; v: string }
  | { k: "ul"; v: string[] }
  | { k: "quote"; v: string }
  | { k: "note"; v: string }
  | { k: "table"; v: { head: string[]; rows: string[][] } }
  /**
   * Infographie. Quatre formes disponibles : `funnel`, `steps`, `bars`
   * et `split`. Elles sont dessinees en code, pas importees en image :
   * leur texte reste donc lisible par Google et par les assistants,
   * et elles pesent quelques centaines d'octets au lieu de plusieurs
   * centaines de kilo-octets.
   */
  | { k: "figure"; v: FigureData };

export type Article = {
  slug: string;
  title: string;
  /** Sous-titre affiche sous le titre, et dans la liste. */
  excerpt: string;
  /** Une categorie courte. Sert de filtre visuel. */
  category: string;
  date: string;
  /** Duree de lecture en minutes, calculee a la main. */
  readingTime: number;
  /** Description pour Google. 150 a 160 caracteres. */
  seo: string;
  /**
   * L'ESSENTIEL — trois a cinq phrases autonomes.
   *
   * C'est le champ le plus important de tout ce fichier pour la
   * recherche assistee par intelligence artificielle.
   *
   * Un moteur classique classe des pages. Un moteur conversationnel —
   * ChatGPT, Perplexity, l'Apercu IA de Google — extrait des reponses.
   * Il cherche des affirmations courtes, autoportantes, qu'il peut
   * citer sans le reste de l'article.
   *
   * Chaque phrase doit donc se comprendre seule, sans « comme on l'a
   * vu plus haut » ni « cela signifie que ». Sortie de son contexte,
   * elle doit rester vraie et complete.
   *
   * Ces phrases sont affichees en haut de l'article, dans un encadre,
   * et reprises telles quelles dans les donnees structurees.
   */
  takeaways: string[];
  /**
   * QUESTIONS FREQUENTES, en fin d'article.
   *
   * Publiees en donnees structurees FAQPage. C'est le format que
   * Google et les moteurs conversationnels reprennent le plus
   * volontiers, parce que la correspondance entre une question posee
   * et une question ecrite est directe.
   *
   * Les questions doivent etre formulees comme un humain les tape,
   * pas comme un service marketing les redige.
   */
  faq: { q: string; a: string }[];
  body: Block[];
};

export const ARTICLES: Article[] = [
  /* ======================================================================
   *  1. TOFU / MOFU / BOFU
   * ==================================================================== */
  {
    slug: "tofu-mofu-bofu-video-publicitaire",
    title: "TOFU, MOFU, BOFU : pourquoi une seule vidéo ne peut pas vendre",
    excerpt:
      "La plupart des campagnes échouent pour une raison mécanique : elles montrent le même film à quelqu'un qui découvre la marque et à quelqu'un qui hésite à acheter. Voici comment nous découpons la production en trois étages.",
    category: "Stratégie",
    date: "2026-08-14",
    readingTime: 9,
    seo: "TOFU, MOFU, BOFU appliqué à la vidéo publicitaire : quel film produire pour chaque étage du tunnel, dans quel ordre, et avec quel budget.",
    takeaways: [
      "TOFU, MOFU et BOFU désignent les trois étages d'un tunnel d'acquisition : le haut, le milieu et le bas de l'entonnoir. Chacun s'adresse à une personne qui en sait plus que la précédente sur la marque.",
      "Une vidéo TOFU dure 8 à 15 secondes, ne parle pas de la marque et sert uniquement à arrêter le défilement. Une vidéo MOFU dure 20 à 45 secondes et apporte la preuve. Une vidéo BOFU dure 10 à 20 secondes et présente l'offre.",
      "Une seule vidéo ne peut pas couvrir les trois étages : elle sera trop commerciale pour une audience froide et trop vague pour une audience prête à acheter.",
      "La répartition de départ recommandée est de deux vidéos TOFU, une MOFU et une BOFU par mois, avec 50 à 60 % du budget média sur le haut du tunnel.",
      "On construit le tunnel en commençant par le bas : le BOFU s'adresse à une audience déjà existante et finance la suite. Ouvrir le TOFU en premier revient à payer pour une attention que rien ne récupère.",
    ],
    faq: [
      {
        q: "Que veulent dire TOFU, MOFU et BOFU ?",
        a: "Ce sont les abréviations de top of funnel, middle of funnel et bottom of funnel — le haut, le milieu et le bas de l'entonnoir de conversion. TOFU désigne les contenus destinés à des personnes qui ne connaissent pas la marque, MOFU celles qui la connaissent mais hésitent, BOFU celles qui sont prêtes à acheter.",
      },
      {
        q: "Combien de vidéos faut-il pour couvrir les trois étages ?",
        a: "Quatre vidéos par mois suffisent pour un tunnel complet : deux TOFU, une MOFU et une BOFU. Le haut du tunnel demande plus de production parce qu'une accroche s'use en trois à six semaines, alors qu'une vidéo de preuve se réutilise pendant des mois.",
      },
      {
        q: "Par quel étage faut-il commencer quand on part de zéro ?",
        a: "Par le bas. Une vidéo BOFU envoyée à une audience déjà existante — visiteurs du site, base client, abonnés — produit des résultats immédiats et finance la construction des étages supérieurs. C'est aussi le test le plus rapide pour savoir si le produit a un angle.",
      },
      {
        q: "Quelle part du budget publicitaire mettre sur chaque étage ?",
        a: "En rythme de croisière : 50 à 60 % sur le TOFU, 20 à 30 % sur le MOFU et 20 % sur le BOFU. Concentrer tout le budget sur le BOFU donne d'excellents résultats pendant trois semaines, puis le coût par lead double parce que l'audience est épuisée.",
      },
    ],
    body: [
      {
        k: "p",
        v: "Un annonceur nous appelle presque toujours avec la même phrase : « j'ai fait une vidéo, je l'ai poussée en publicité, ça n'a rien donné ». Neuf fois sur dix, la vidéo n'était pas mauvaise. Elle était seule.",
      },
      {
        k: "p",
        v: "Une publicité ne fait pas passer quelqu'un de l'ignorance à l'achat. Elle le fait avancer d'un cran. Si vous n'avez qu'un cran, tout le monde reste au même endroit.",
      },

      { k: "h2", v: "Les trois étages, en une phrase chacun" },
      {
        k: "p",
        v: "TOFU, MOFU et BOFU découpent l'entonnoir — le tunnel — en trois moments. Le vocabulaire vient de l'anglais top, middle et bottom of funnel : le haut, le milieu et le bas de l'entonnoir. Derrière ces sigles, il n'y a qu'une question : qu'est-ce que la personne sait déjà de vous au moment où votre vidéo apparaît ?",
      },
      {
        k: "figure",
        v: {
          type: "funnel",
          caption:
            "Les trois étages du tunnel. La largeur représente le volume d'audience touchée : beaucoup de monde en haut, peu de monde en bas, mais une valeur par personne qui augmente à chaque étage.",
          levels: [
            {
              label: "TOFU — haut",
              value: "8 à 15 s",
              sub: "La personne ne vous connaît pas. La vidéo doit arrêter le pouce et poser un problème qu'elle reconnaît.",
              note: "Audience froide · 50 à 60 % du budget",
            },
            {
              label: "MOFU — milieu",
              value: "20 à 45 s",
              sub: "Elle vous a vu mais n'a pas décidé. La vidéo doit prouver que vous savez faire.",
              note: "Audience ayant déjà interagi · 20 à 30 % du budget",
            },
            {
              label: "BOFU — bas",
              value: "10 à 20 s",
              sub: "Elle hésite et compare. La vidéo doit lever le dernier frein et faire agir.",
              note: "Audience chaude · 20 % du budget",
            },
          ],
        },
      },
      {
        k: "quote",
        v: "Une vidéo BOFU montrée à quelqu'un qui ne vous connaît pas ne vend rien. Elle agace.",
      },

      { k: "h2", v: "TOFU — la vidéo qui arrête le pouce" },
      {
        k: "p",
        v: "En haut du tunnel, votre concurrent n'est pas l'autre marque. C'est le pouce du spectateur. Vous avez entre une et deux secondes avant qu'il ne défile, et la personne n'a rien demandé.",
      },
      {
        k: "p",
        v: "Une vidéo TOFU ne parle donc jamais de vous. Elle parle d'un problème que la personne reconnaît immédiatement, ou elle montre quelque chose qu'elle n'a pas l'habitude de voir. Le nom de la marque peut n'apparaître qu'à la fin, et parfois pas du tout.",
      },
      {
        k: "ul",
        v: [
          "Durée : 8 à 15 secondes. Au-delà, la chute d'attention est brutale.",
          "L'accroche tient dans les 2 premières secondes, sans logo, sans introduction.",
          "Aucun jargon métier : la personne ne sait pas encore de quoi vous parlez.",
          "Un seul message. Deux messages dans une vidéo TOFU, c'est zéro message.",
        ],
      },
      {
        k: "p",
        v: "C'est l'étage où le volume compte le plus. Une accroche qui fonctionne ne se devine pas, elle se trouve — et pour la trouver il faut en tester plusieurs. C'est la raison pour laquelle nos formules mensuelles comportent quatre vidéos et non une : quatre angles différents sur le même produit, dont un seul, en général, se détache vraiment.",
      },

      { k: "h2", v: "MOFU — la vidéo qui prouve" },
      {
        k: "p",
        v: "Au milieu, la personne vous a déjà vu. Elle n'a pas besoin d'être surprise, elle a besoin d'être rassurée. C'est l'étage le plus souvent oublié, et c'est celui où se perdent le plus de ventes : le prospect a compris le problème, il ne sait pas encore pourquoi ce serait vous plutôt qu'un autre.",
      },
      {
        k: "ul",
        v: [
          "Démonstration réelle du produit ou du service, filmée sans effet.",
          "Coulisses, méthode, atelier : ce qui montre que vous savez faire.",
          "Témoignage client, si et seulement si le client est réel et nommé.",
          "Comparaison honnête : ce que vous faites, ce que vous ne faites pas.",
        ],
      },
      {
        k: "p",
        v: "Le format s'allonge : 20 à 45 secondes. On accepte ici que la personne regarde plus longtemps, parce qu'elle a déjà manifesté un intérêt. Le ciblage aussi change : on ne s'adresse plus à une audience froide, mais à ceux qui ont vu la vidéo TOFU, visité le site ou interagi avec le compte.",
      },
      {
        k: "note",
        v: "C'est à cet étage que se joue la différence entre une agence qui livre des vidéos et une agence qui pilote la diffusion. Une vidéo MOFU envoyée à une audience froide dépense du budget pour rien. Le film peut être excellent : montré au mauvais moment, il ne prouve rien à personne.",
      },

      { k: "h2", v: "BOFU — la vidéo qui fait agir" },
      {
        k: "p",
        v: "En bas, la personne est prête. Elle compare, elle calcule, elle repousse. Votre vidéo n'a plus qu'un travail : supprimer la dernière raison de ne pas y aller.",
      },
      {
        k: "ul",
        v: [
          "L'offre est dite clairement, avec son prix ou sa condition d'entrée.",
          "La garantie, le délai ou la réversibilité sont montrés, pas suggérés.",
          "Un seul appel à l'action, répété. Pas trois options.",
          "Durée courte à nouveau : 10 à 20 secondes suffisent.",
        ],
      },
      {
        k: "p",
        v: "C'est l'étage le moins créatif et le plus rentable. Le coût par acquisition y est presque toujours le plus bas du compte — ce qui pousse beaucoup d'annonceurs à n'investir que là. C'est une erreur de court terme : sans TOFU, l'audience BOFU s'épuise en quelques semaines et le coût explose.",
      },

      { k: "h2", v: "Comment nous répartissons la production" },
      {
        k: "p",
        v: "Sur quatre vidéos par mois, notre répartition de départ est la suivante. Elle bouge ensuite selon ce que disent les chiffres.",
      },
      {
        k: "figure",
        v: {
          type: "bars",
          caption:
            "Répartition du budget média sur quatre vidéos mensuelles. Le haut de tunnel concentre plus de la moitié de la dépense parce que c'est le seul étage où l'on cherche encore.",
          unit: "Part du budget publicitaire mensuel, hors production.",
          bars: [
            { label: "TOFU — 2 vidéos", value: 55, display: "50 à 60 %", highlight: true },
            { label: "MOFU — 1 vidéo", value: 25, display: "20 à 30 %" },
            { label: "BOFU — 1 vidéo", value: 20, display: "20 %" },
          ],
        },
      },
      {
        k: "p",
        v: "Deux vidéos TOFU parce que c'est l'étage où l'on cherche encore. Une MOFU et une BOFU parce que ces deux-là, une fois trouvées, se réutilisent pendant des mois : une bonne vidéo de preuve ne s'use presque pas, une accroche s'use en trois semaines.",
      },
      {
        k: "quote",
        v: "L'accroche s'use. La preuve, non. C'est pour cela qu'on produit plus de haut de tunnel que de bas.",
      },

      { k: "h2", v: "L'ordre dans lequel on construit" },
      {
        k: "p",
        v: "Contre-intuitivement, on ne commence pas par le haut. On commence par le bas.",
      },
      {
        k: "figure",
        v: {
          type: "steps",
          caption:
            "L'ordre de construction, à l'envers de l'ordre de lecture. On installe d'abord ce qui convertit, ensuite ce qui attire.",
          steps: [
            {
              label: "Semaine 1 — BOFU",
              sub: "Une audience prête existe déjà : visiteurs du site, base client, abonnés.",
            },
            {
              label: "Semaines 2 à 4 — MOFU",
              sub: "On installe la preuve pendant que le BOFU tourne et rapporte.",
            },
            {
              label: "Mois 2 — TOFU",
              sub: "On ouvre le haut une fois que ce qui suit est en place.",
            },
            {
              label: "Mois 3 — Bascule",
              sub: "Le budget se déplace vers le haut, le bas fonctionne seul.",
            },
          ],
        },
      },
      {
        k: "p",
        v: "Ouvrir le TOFU en premier, c'est verser de l'eau dans un tuyau qui n'est pas encore raccordé. Vous payez pour de l'attention que rien ne récupère.",
      },

      { k: "h2", v: "Les trois erreurs que nous voyons le plus" },
      {
        k: "ul",
        v: [
          "Une seule vidéo poussée sur tout le monde. Elle est forcément trop vague pour le bas et trop commerciale pour le haut.",
          "Tout le budget en BOFU. Les résultats sont excellents trois semaines, puis le coût par lead double sans explication apparente : l'audience est simplement épuisée.",
          "Changer de vidéo trop vite. Une accroche a besoin de quelques milliers d'impressions avant de dire quelque chose. Couper au bout de deux jours, c'est ne jamais rien apprendre.",
        ],
      },

      { k: "h2", v: "Ce que ça donne concrètement" },
      {
        k: "p",
        v: "Le mois d'ouverture sert à poser les trois étages et à trouver l'accroche. Les mois suivants servent à remplacer ce qui s'use — c'est-à-dire, presque toujours, le haut du tunnel. C'est exactement le rythme de nos formules mensuelles : quatre vidéos, réparties sur les trois étages, et une diffusion pilotée qui décide où va chaque euro.",
      },
      {
        k: "note",
        v: "Si vous partez de zéro, ne cherchez pas à construire les trois étages le premier mois. Une seule vidéo BOFU envoyée à votre base existante vous apprendra plus, et plus vite, que trois films envoyés à des inconnus.",
      },
    ],
  },

  /* ======================================================================
   *  2. LE PRIX D'UNE VIDEO
   * ==================================================================== */
  {
    slug: "combien-coute-une-video-publicitaire",
    title: "Combien coûte une vidéo publicitaire, et pourquoi les écarts sont énormes",
    excerpt:
      "Entre 200 € et 8 000 € pour un objet qui porte le même nom. Ce qui change vraiment d'un devis à l'autre, et les questions à poser avant de signer.",
    category: "Tarifs",
    date: "2026-08-10",
    readingTime: 6,
    seo: "Prix d'une vidéo publicitaire : ce qui fait varier un devis de 200 à 8 000 €, et les cinq questions à poser avant de choisir un prestataire.",
    takeaways: [
      "Le prix d'une vidéo publicitaire varie de 150 € pour un simple montage à plus de 15 000 € pour une production avec équipe complète et comédiens.",
      "Pour de la publicité en ligne, la gamme pertinente se situe entre 400 et 1 200 € : écriture, tournage et montage avec une équipe réduite.",
      "Cinq facteurs expliquent l'essentiel des écarts : la présence ou non d'un tournage, le temps passé à l'écriture, les intervenants externes, le nombre de déclinaisons et l'inclusion ou non du pilotage des campagnes.",
      "Le budget publicitaire versé aux plateformes n'est presque jamais inclus dans le prix d'une vidéo. C'est la première source de malentendu entre une agence et son client.",
      "Sur un feed de téléphone, un plan à 8 000 € et un plan à 400 € occupent la même surface d'écran pendant la même seconde et demie. L'accroche pèse davantage que le budget de tournage.",
    ],
    faq: [
      {
        q: "Combien coûte une vidéo publicitaire pour Meta ou TikTok ?",
        a: "Comptez 400 à 1 200 € pour une production légère comprenant écriture, tournage et montage. En dessous de 400 €, il s'agit généralement d'un montage à partir d'images que vous fournissez. Au-dessus de 3 000 €, on entre dans la production lourde, rarement justifiée pour de la publicité en ligne.",
      },
      {
        q: "Le budget publicitaire est-il compris dans le prix d'une vidéo ?",
        a: "Non, presque jamais. Le budget média est versé directement aux plateformes depuis votre propre compte publicitaire. Il s'ajoute au coût de production. Prévoyez 800 à 1 500 € par mois pour démarrer selon le secteur.",
      },
      {
        q: "Quelles questions poser avant de signer un devis vidéo ?",
        a: "Cinq questions suffisent : le budget publicitaire est-il inclus, combien de versions du montage sont comprises, à qui appartiennent les fichiers sources et le compte publicitaire, qui paie les comédiens et les lieux, et que se passe-t-il si la vidéo ne performe pas.",
      },
      {
        q: "Une vidéo plus chère est-elle plus efficace ?",
        a: "Pas mécaniquement. Au-delà d'un certain seuil de qualité technique, le budget de tournage ne se voit plus sur un écran de téléphone. Ce qui fait la différence de performance est l'angle publicitaire et la qualité des deux premières secondes.",
      },
    ],
    body: [
      {
        k: "p",
        v: "C'est la question qu'on nous pose en premier, et c'est aussi celle à laquelle il est le plus difficile de répondre honnêtement, parce que « une vidéo publicitaire » ne désigne pas un objet mais une famille d'objets qui n'ont presque rien en commun.",
      },

      { k: "h2", v: "Ce qui fait vraiment varier un devis" },
      {
        k: "ul",
        v: [
          "Le tournage. Une vidéo montée à partir d'images existantes et une vidéo tournée sur place ne sont pas la même prestation. Le tournage, c'est une équipe, une journée, du matériel et un lieu.",
          "L'écriture. Un script trouvé après trois versions coûte plus cher qu'un script écrit d'un jet — et il vend souvent trois fois mieux.",
          "Les intervenants. Un comédien, un mannequin ou un lieu payant s'ajoutent toujours au devis. Une agence qui ne le mentionne pas vous le facturera plus tard.",
          "Les déclinaisons. Une vidéo ou une vidéo déclinée en quatre formats, ce n'est pas le même travail de montage.",
          "La diffusion. Certains prix incluent le pilotage des campagnes, d'autres non. C'est la plus grosse source de malentendu.",
        ],
      },

      { k: "h2", v: "Les trois grandes gammes du marché" },
      {
        k: "figure",
        v: {
          type: "bars",
          caption:
            "Les trois gammes du marché, en prix moyen constaté. La gamme du milieu est celle qui convient à la quasi-totalité des campagnes en ligne.",
          unit: "Prix hors taxes pour une vidéo, hors budget publicitaire.",
          bars: [
            { label: "Montage seul, sans tournage", value: 275, display: "150 à 400 €" },
            {
              label: "Production légère — équipe réduite",
              value: 800,
              display: "400 à 1 200 €",
              highlight: true,
            },
            { label: "Production lourde — équipe complète", value: 9000, display: "3 000 à 15 000 €" },
          ],
        },
      },
      {
        k: "p",
        v: "Pour de la publicité en ligne, la gamme du milieu est presque toujours la bonne. La production lourde produit des films magnifiques que l'algorithme traite exactement comme les autres — et sur un feed, un plan à 8 000 € et un plan à 400 € occupent la même surface d'écran pendant la même seconde et demie.",
      },
      {
        k: "quote",
        v: "Sur un téléphone, un budget de tournage ne se voit pas. Une bonne accroche, si.",
      },

      { k: "h2", v: "Les cinq questions à poser avant de signer" },
      {
        k: "ul",
        v: [
          "Le budget publicitaire est-il inclus ? La réponse est presque toujours non, et c'est normal — mais il doit être écrit.",
          "Combien de versions du montage sont comprises ? Deux allers-retours est la norme. Illimité n'existe pas.",
          "À qui appartiennent les fichiers sources et le compte publicitaire ?",
          "Qui paie les comédiens, les lieux, la musique sous licence ?",
          "Que se passe-t-il si la vidéo ne performe pas ? Une agence sérieuse a une réponse préparée, qui n'est ni « on recommence gratuitement » ni « ce n'est pas notre problème ».",
        ],
      },

      { k: "h2", v: "Ce que nous pratiquons" },
      {
        k: "p",
        v: "Nous publions nos prix, ligne par ligne, sur la page tarifs — y compris ce qui n'est jamais compris. Ce n'est pas de la transparence pour le principe : c'est parce que la quasi-totalité des ruptures entre une agence et un client vient d'une ligne dont personne n'avait parlé avant de commencer.",
      },
    ],
  },

  /* ======================================================================
   *  3. POURQUOI 4 VIDEOS
   * ==================================================================== */
  {
    slug: "pourquoi-quatre-videos-par-mois",
    title: "Pourquoi quatre vidéos par mois, et pas une très bonne",
    excerpt:
      "Personne ne sait à l'avance quelle accroche va fonctionner — ni vous, ni nous, ni l'algorithme. Ce qui décide, c'est le nombre d'essais.",
    category: "Méthode",
    date: "2026-08-06",
    readingTime: 5,
    seo: "Pourquoi produire quatre vidéos publicitaires par mois plutôt qu'une seule : usure créative, test d'angles et logique des algorithmes de diffusion.",
    takeaways: [
      "Une vidéo publicitaire qui fonctionne voit son coût par résultat augmenter au bout de trois à six semaines. Ce phénomène s'appelle la fatigue créative et il est inévitable.",
      "Personne ne peut prédire quel angle publicitaire va fonctionner : sur quatre angles également défendables, les équipes expérimentées se trompent environ une fois sur deux.",
      "Les algorithmes de diffusion optimisent en comparant plusieurs créations entre elles. Avec une seule vidéo, la plateforme n'a rien à comparer et le coût reste plus élevé.",
      "Quatre vidéos par mois permettent de tester quatre angles, de conserver une réserve pendant que la vidéo en tête s'use, et d'alimenter les trois étages du tunnel.",
      "Avec un budget limité, une seule vidéo reste utile — mais il faut la considérer comme un test destiné à identifier un angle, pas comme une campagne.",
    ],
    faq: [
      {
        q: "Combien de vidéos publicitaires faut-il produire par mois ?",
        a: "Quatre est le seuil à partir duquel un dispositif devient stable : deux pour le haut de tunnel, une pour la preuve, une pour l'offre. En dessous, il n'y a pas assez de matière pour tester des angles ni pour compenser l'usure créative.",
      },
      {
        q: "Qu'est-ce que la fatigue créative en publicité ?",
        a: "C'est l'augmentation progressive du coût par résultat d'une publicité qui a bien fonctionné. Elle n'est pas due à une dégradation de la vidéo mais au fait que l'audience ciblée l'a déjà vue plusieurs fois. Elle apparaît généralement entre la troisième et la sixième semaine.",
      },
      {
        q: "Vaut-il mieux une vidéo très soignée ou plusieurs vidéos correctes ?",
        a: "Plusieurs vidéos correctes, dans la quasi-totalité des cas. L'angle gagnant dépend de l'audience, du moment et de la concurrence sur les enchères — aucune expertise ne remplace un test, et un test demande plusieurs variantes.",
      },
    ],
    body: [
      {
        k: "p",
        v: "C'est l'objection la plus fréquente à nos formules mensuelles : « je préfère une seule vidéo, mais vraiment bien faite ». C'est une intuition raisonnable, et elle est fausse pour deux raisons mécaniques.",
      },

      { k: "h2", v: "Première raison : personne ne sait à l'avance" },
      {
        k: "p",
        v: "Sur un même produit, quatre angles sont toujours défendables : la preuve, l'émotion, l'offre, l'urgence. Quand nous demandons à une équipe de parier sur celui qui va gagner, elle se trompe environ une fois sur deux. Nous aussi.",
      },
      {
        k: "p",
        v: "Ce n'est pas un manque de métier, c'est la nature du problème : l'accroche gagnante dépend de l'audience, du moment, de la concurrence sur les enchères ce mois-là. Aucune expertise ne remplace un test.",
      },
      {
        k: "quote",
        v: "Une agence qui vous promet la bonne accroche du premier coup vous vend une certitude qu'elle n'a pas.",
      },

      { k: "h2", v: "Deuxième raison : une accroche s'use" },
      {
        k: "p",
        v: "Une vidéo qui fonctionne bien voit son coût par résultat monter au bout de trois à six semaines. Ce n'est pas la vidéo qui se dégrade : c'est l'audience qui l'a déjà vue. Les plateformes appellent ça la fatigue créative, et elle est inévitable.",
      },
      {
        k: "p",
        v: "Avec une seule vidéo, vous n'avez donc pas un actif : vous avez un compte à rebours. Quand elle s'use, la campagne s'arrête, et il faut recommencer un cycle de production complet pendant que rien ne tourne.",
      },

      { k: "h2", v: "Ce que quatre vidéos permettent réellement" },
      {
        k: "figure",
        v: {
          type: "split",
          caption:
            "Ce que change le passage d'une vidéo à quatre. La colonne de gauche décrit un pari, celle de droite un dispositif.",
          left: {
            title: "Avec une seule vidéo",
            items: [
              "Un seul angle testé, choisi au jugé",
              "Aucune réserve quand elle s'use",
              "Un seul étage du tunnel alimenté",
              "Rien à comparer pour l'algorithme",
              "Campagne à l'arrêt pendant la production suivante",
            ],
          },
          right: {
            title: "Avec quatre vidéos par mois",
            items: [
              "Quatre angles testés en parallèle",
              "Une réserve prête quand la première fatigue",
              "Les trois étages alimentés en continu",
              "De quoi laisser l'algorithme arbitrer",
              "Aucune interruption de diffusion",
            ],
          },
        },
      },
      {
        k: "note",
        v: "Le dernier point est le moins intuitif. Les plateformes publicitaires optimisent la diffusion en comparant des créations entre elles. Avec une seule vidéo, il n'y a rien à comparer : vous privez le système du levier qui lui permet de baisser votre coût.",
      },

      { k: "h2", v: "Et si le budget ne le permet pas ?" },
      {
        k: "p",
        v: "Alors commencez par une, mais sachez ce que vous achetez : un test, pas une campagne. C'est exactement ce à quoi sert notre formule Essai — une vidéo, deux semaines de diffusion, et un rapport. Elle ne prétend pas installer un tunnel. Elle vous dit si le produit a un angle.",
      },
    ],
  },

  /* ======================================================================
   *  4. LE FORMAT VERTICAL
   * ==================================================================== */
  {
    slug: "format-vertical-9-16",
    title: "Le format vertical n'est pas un recadrage",
    excerpt:
      "Prendre une vidéo horizontale et couper les bords produit une vidéo verticale techniquement conforme et commercialement morte. Ce qui change vraiment quand on tourne pour le 9/16.",
    category: "Production",
    date: "2026-07-28",
    readingTime: 4,
    seo: "Format vertical 9/16 en publicité : pourquoi recadrer une vidéo horizontale ne fonctionne pas, et comment composer directement pour le téléphone.",
    takeaways: [
      "Recadrer une vidéo tournée en 16/9 vers du 9/16 supprime environ 60 % de la surface de l'image, et généralement le sujet avec.",
      "Une vidéo destinée au format vertical se cadre plus serré, avec le sujet placé dans le tiers haut de l'image.",
      "Le tiers bas doit rester libre : c'est la zone où les plateformes affichent leurs boutons, le nom du compte et le texte de la publicité.",
      "Les mouvements de caméra latéraux ne fonctionnent pas en vertical : un panoramique horizontal traverse un cadre étroit en une demi-seconde.",
      "Tout doit rester compréhensible sans le son, la majorité des vues démarrant en lecture muette.",
    ],
    faq: [
      {
        q: "Peut-on transformer une vidéo horizontale en vidéo verticale ?",
        a: "Techniquement oui, mais le résultat convertit rarement. Le recadrage supprime environ 60 % de l'image, décale la composition et fait souvent sortir le texte du cadre. Cela ne se défend que si la vidéo d'origine a été tournée en haute définition avec des plans volontairement aérés, et que cette décision a été prise avant le tournage.",
      },
      {
        q: "Quel format pour une publicité Meta, TikTok ou YouTube Shorts ?",
        a: "Le 9/16, soit 1080 x 1920 pixels. C'est le format natif des Reels, des Stories, de TikTok et des Shorts. Une vidéo carrée ou horizontale y occupe moins de surface d'écran et perd en impact.",
      },
      {
        q: "Où placer le texte dans une vidéo verticale ?",
        a: "Dans la moitié haute, en évitant les 20 % inférieurs de l'image où les plateformes superposent leur interface. Le texte doit rester lisible sans le son, puisque la plupart des vues démarrent en muet.",
      },
    ],
    body: [
      {
        k: "p",
        v: "Nous recevons régulièrement des vidéos d'entreprise tournées en 16/9, avec la demande de les « passer en vertical pour les réseaux ». C'est faisable en dix minutes. Le résultat ne convertit presque jamais.",
      },

      { k: "h2", v: "Ce que le recadrage détruit" },
      {
        k: "figure",
        v: {
          type: "bars",
          caption:
            "Ce qu'il reste d'une image quand on la fait passer d'un format à l'autre. Le recadrage d'un 16/9 vers du 9/16 ne conserve qu'environ quatre dixièmes de la surface d'origine.",
          unit: "Surface de l'image conservée après recadrage.",
          bars: [
            { label: "Tourné directement en 9/16", value: 100, display: "100 %", highlight: true },
            { label: "16/9 recadré en 9/16", value: 40, display: "environ 40 %" },
            { label: "16/9 recadré en 1/1", value: 56, display: "environ 56 %" },
          ],
        },
      },
      {
        k: "ul",
        v: [
          "La composition. Un plan large horizontal recadré en vertical perd la majeure partie de son image, et généralement le sujet avec.",
          "Le texte à l'écran. Positionné pour un cadre large, il sort du cadre ou se retrouve sous l'interface de l'application.",
          "Le rythme. Une vidéo horizontale est écrite pour un écran qu'on regarde ; une verticale, pour un écran qu'on fait défiler.",
        ],
      },

      { k: "h2", v: "Ce qu'on fait différemment au tournage" },
      {
        k: "ul",
        v: [
          "Les sujets sont cadrés plus serré, et centrés dans le tiers haut de l'image.",
          "Le tiers bas est laissé libre : c'est là que les plateformes posent leurs boutons, leur texte et leur nom de compte.",
          "Le mouvement est vertical plutôt que latéral — un panoramique horizontal traverse un cadre étroit en une demi-seconde.",
          "Tout est lisible sans le son. La majorité des vues démarrent en muet.",
        ],
      },
      {
        k: "quote",
        v: "Une vidéo verticale bien tournée reste regardable en horizontal. L'inverse n'est presque jamais vrai.",
      },

      { k: "h2", v: "Le cas où le recadrage se défend" },
      {
        k: "p",
        v: "Quand la vidéo d'origine a été tournée en très haute définition avec des plans larges volontairement aérés, on peut y prélever un cadre vertical propre. C'est une décision qui se prend avant le tournage, pas après — et c'est ce que nous faisons quand un même contenu doit vivre en télévision et sur téléphone.",
      },
    ],
  },

  /* ======================================================================
   *  5. HUMAINS + IA
   * ==================================================================== */
  {
    slug: "ce-que-l-ia-fait-vraiment-dans-notre-production",
    title: "Ce que l'intelligence artificielle fait vraiment dans notre production",
    excerpt:
      "Tout le monde annonce de l'IA, presque personne ne dit où elle intervient. Voici la liste exacte, y compris ce que nous refusons de lui confier.",
    category: "Méthode",
    date: "2026-07-20",
    readingTime: 5,
    seo: "IA et production vidéo : où l'intelligence artificielle fait gagner du temps, où elle dégrade le résultat, et pourquoi le tournage reste humain.",
    takeaways: [
      "L'intelligence artificielle fait gagner du temps sur quatre tâches de production vidéo : le dérushage, les sous-titres, la déclinaison de scripts validés et le premier tri des données de performance.",
      "Ces quatre tâches ont un point commun : elles sont fastidieuses, vérifiables en un coup d'œil, et une erreur y est sans conséquence.",
      "Quatre décisions restent humaines chez ULTRA VISION : l'angle publicitaire, le tournage, les témoignages et le montage final.",
      "Un visage généré par intelligence artificielle se repère, et une marque prise à montrer des personnes qui n'existent pas perd davantage de crédibilité qu'elle n'a gagné de temps.",
      "Un faux témoignage client constitue une pratique commerciale trompeuse, quelle que soit la technologie utilisée pour le produire.",
    ],
    faq: [
      {
        q: "L'IA peut-elle remplacer un tournage vidéo ?",
        a: "Pour de la publicité de marque, non. Les visages et les environnements générés restent identifiables, et le risque de crédibilité dépasse le gain de temps. L'IA est en revanche efficace en amont et en aval du tournage : préparation, dérushage, sous-titrage, déclinaisons.",
      },
      {
        q: "Utilisez-vous l'IA pour écrire les scripts publicitaires ?",
        a: "Pour décliner un angle déjà validé en plusieurs variantes courtes, oui. Pour trouver l'angle lui-même, non : cette décision demande de connaître le client, son marché et ce qu'il ne peut pas dire.",
      },
      {
        q: "Comment savoir si une agence utilise l'IA de façon honnête ?",
        a: "Demandez-lui la liste précise des tâches concernées, et surtout celles qu'elle refuse de lui confier. Une agence qui répond « nous sommes boostés par l'IA » sans pouvoir détailler n'a probablement pas réfléchi à la question.",
      },
    ],
    body: [
      {
        k: "p",
        v: "« Boosté par l'IA » ne veut plus rien dire. Autant être précis : voici où elle intervient chez nous, et où nous avons décidé qu'elle n'interviendrait pas.",
      },

      { k: "h2", v: "Là où elle fait gagner du temps" },
      {
        k: "ul",
        v: [
          "Le dérushage. Retrouver les prises exploitables dans quatre heures d'images prenait une demi-journée. C'est aujourd'hui une affaire de minutes.",
          "Les sous-titres. Transcription automatique, puis relecture humaine. Le gain est réel et le risque faible.",
          "Les variantes de script. Décliner un angle validé en quatre versions courtes, pour tester.",
          "Le premier tri des performances. Repérer dans les données ce qui mérite un œil, avant de l'analyser nous-mêmes.",
        ],
      },
      {
        k: "p",
        v: "Le point commun de ces quatre tâches : elles sont fastidieuses, vérifiables en un coup d'œil, et une erreur y est sans conséquence. Ce sont exactement les critères qui rendent l'automatisation raisonnable.",
      },

      { k: "h2", v: "Là où nous ne l'utilisons pas" },
      {
        k: "figure",
        v: {
          type: "split",
          caption:
            "Le partage exact. À gauche ce que nous confions à la machine, à droite ce que nous gardons. Le critère est simple : une erreur y est-elle rattrapable en un coup d'œil ?",
          left: {
            title: "Jamais confié à l'IA",
            items: [
              "L'angle publicitaire et la promesse",
              "Le tournage et les visages",
              "Les témoignages clients",
              "Le montage final et son rythme",
            ],
          },
          right: {
            title: "Confié à l'IA",
            items: [
              "Le dérushage de plusieurs heures d'images",
              "La transcription des sous-titres",
              "Les variantes d'un script déjà validé",
              "Le premier tri des données de performance",
            ],
          },
        },
      },
      {
        k: "ul",
        v: [
          "L'angle publicitaire. C'est la décision qui détermine tout le reste, et elle demande de connaître le client, son marché et ce qu'il ne peut pas dire.",
          "Le tournage. Un visage généré se repère, et une marque qui se fait prendre à montrer des gens qui n'existent pas perd davantage qu'elle n'a gagné.",
          "Les témoignages. Jamais. Un faux témoignage est une pratique commerciale trompeuse, quelle que soit la technologie employée.",
          "Le montage final. Le rythme d'une vidéo publicitaire se décide à l'image près, et c'est encore un métier.",
        ],
      },
      {
        k: "quote",
        v: "L'IA nous fait gagner des heures sur ce qui est fastidieux. Elle ne nous a jamais fait gagner une idée.",
      },

      { k: "h2", v: "Pourquoi nous le disons dans cet ordre" },
      {
        k: "p",
        v: "Sur notre page d'accueil, la phrase est « pensé, tourné et monté par des humains, décuplé par l'intelligence artificielle ». L'ordre est délibéré. Sur un marché où tout le monde annonce de l'IA, ce qui devient rare n'est plus l'IA — c'est la main humaine. Le rare doit passer devant.",
      },
      {
        k: "note",
        v: "Cette page sera mise à jour quand nos pratiques changeront. Si vous lisez cet article dans six mois et que la liste vous paraît datée, dites-le-nous : c'est qu'elle l'est.",
      },
    ],
  },
];

/** Articles triés du plus récent au plus ancien. */
export const ARTICLES_SORTED = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

/** Retrouve un article par son identifiant d'adresse. */
export const findArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/** Date lisible : « 14 août 2026 ». */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
