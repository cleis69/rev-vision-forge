# Supabase · Plan de vente interactif

Projet Supabase dédié au module SaaS (voir `SPEC-plan-de-vente.md`) :
`rev-plan-de-vente` (réf. `hbihlcnhmjommcnpujam`, Paris), organisation REV, offre
gratuite pour le développement. **À passer en offre Pro avant la mise en service.**

- `migrations/` : schéma, sécurité (RLS), stockage, fonctions, puis corrections de
  l'audit Supabase (fonctions internes dans le schéma `private`, index), à appliquer
  dans l'ordre. Toutes sont appliquées sur le projet.
- Types TypeScript : `bun run db:types` (CLI Supabase connectée) régénère
  `src/lib/supabase/database.types.ts` après chaque migration.
- `tests/rls_test.sql` : tests de sécurité. À exécuter avec le rôle des migrations
  (éditeur SQL Supabase, `psql` ou MCP). Le script finit toujours par une erreur
  volontaire pour tout annuler : le message est le rapport
  (`RLS TESTS PASSED n/n`, ou la liste des échecs).

Règles retenues :

- Le public ne lit jamais la table `lots` : il passe par la vue `public_lots`
  (programmes publiés, prix masqué si `show_prices = false`), et par `public_projects`
  pour la marque du promoteur.
- Les demandes de visite passent uniquement par `submit_lead` : programme publié,
  5 demandes par heure et par session, 20 par heure et par adresse IP.
- Une organisation se crée avec `create_organization`, qui inscrit son créateur comme
  propriétaire ; une organisation garde toujours au moins un propriétaire.
- Les membres (propriétaires et commerciaux) créent et modifient les programmes ; seuls
  les propriétaires les suppriment, car cela efface aussi leurs lots et leurs demandes.
- Temps réel : chaque modification d'un lot envoie un signal (numéro et statut, jamais
  le prix) sur le canal privé `programme:<id>`. Les visiteurs ne peuvent écouter que les
  programmes publiés, les membres aussi leurs brouillons, et personne ne peut y écrire
  depuis un navigateur (aucune règle d'écriture sur `realtime.messages`).
- Fichiers : bucket `project-media`, lecture publique, chemins
  `<organization_id>/<project_id>/…` ou `<organization_id>/brand/…`, écriture réservée
  aux membres de l'organisation.

Demandes de visite :

- Le formulaire de la page publique passe par `submit_lead`. Chaque nouvelle demande
  apparaît en direct dans l'onglet Demandes (temps réel sur `leads`, filtré par la RLS) et
  déclenche la fonction `functions/notify-lead` (via `pg_net`), qui écrit aux membres de
  l'organisation.
- Tant qu'aucun service d'e-mail n'est configuré, la fonction n'envoie rien (réponse
  « skipped »). Pour l'activer avec Resend : créer le compte, valider le domaine
  realestatevision360.com (DNS chez Cloudflare), puis dans Supabase, Edge Functions,
  Secrets, ajouter `RESEND_API_KEY` (et `NOTIFY_FROM` si l'expéditeur change).
- La fonction ne traite qu'une demande de moins de 10 minutes pas encore notifiée : un
  appel venu d'ailleurs ne peut rien faire envoyer d'autre.

Situation :

- Le programme a une adresse, une position (latitude et longitude, renseignées ensemble)
  et une liste de lieux proches `places` (12 au plus, `{ name, minutes, mode }`, mode
  `voiture` ou `pied`), vérifiée par `is_valid_places`. Le public les lit dans
  `public_projects`. Carte : OpenFreeMap (sans clé ni cookie) ; recherche d'adresse dans
  l'espace promoteur : Nominatim (OpenStreetMap), à la demande seulement.

Vues du plan :

- Un programme a plusieurs vues dans `project_views` : vue aérienne, toiture, niveaux
  (`kind = 'niveau'` et `level` : -1 pour R-1, 0 pour le RDC, 1 pour R+1…), vue piéton
  ou autre. Chacune a son image (en 4 096 et 1 600 px, fichiers dans
  `<organisation>/<programme>/plan/`) et son ordre ; une seule peut être la vue
  principale (`is_main`), montrée d'abord sur les pages publiques.
- `lot_shapes` : une forme par lot et par vue (`unique (lot_id, view_id)`), la vue du même
  programme que le lot. Supprimer une vue supprime ses formes.
- Les lots ont un niveau (`lots.niveau`), lu par le public dans `public_lots`.
- Les colonnes `plan_*` de `projects` ont disparu : le plan unique de chaque programme
  est devenu sa première vue (« Vue aérienne »), en deux migrations pour que le site en
  ligne continue de marcher entre les deux.

Vue orbitale :

- La séquence est dans `media` : `orbit_frame` (vues WebP en 2 048 et 1 280 px) et
  `orbit_mask` (masques PNG en 1 024 px, réduits sans lissage), rangées par `sort_order`,
  fichiers dans `<organisation>/<programme>/orbit/<séquence>/`.
- `orbit_colors` liste les couleurs trouvées dans les masques (part des pixels) et le lot
  de chacune ; `lot_id` reste vide tant que le promoteur ne l'a pas associée, et le
  redevient si le lot est supprimé. Une couleur par lot. Lecture publique pour les
  programmes publiés, écriture par les membres.
- Les vues (orbitale, aérienne, piéton) de la démo « Villas de démonstration » sont des
  rendus Three.js générés depuis le plan, avec les masques ou les formes des lots
  calculés depuis un rendu des mêmes lots en couleurs pleines, sous le même angle.

Statistiques :

- Les pages publiques enregistrent dans `lot_events` les affichages de la page, les
  fiches de lots ouvertes, les clics sur le plan et les partages, avec un identifiant
  aléatoire par onglet (`sessionStorage`, sans cookie). Rien n'est enregistré depuis un
  navigateur connecté à l'espace promoteur, ni en mode présentation.
- L'onglet Statistiques lit `project_stats(programme, jours, fuseau)` : les totaux de la
  période (jours calendaires dans le fuseau de l'utilisateur), ceux de la période
  précédente de même durée, une ligne par jour et une par lot. Fonction
  `security invoker` : la RLS s'applique, et un non-membre est refusé.

Audit de sécurité Supabase : il signale `public_lots` et `public_projects`
(« security definer view »), ainsi que `submit_lead` et `create_organization`
appelables par l'API. C'est voulu : ce sont les seules portes d'entrée publiques,
et elles ne laissent passer que ce qui est permis. Il signale aussi l'extension
`pg_net` installée dans le schéma `public` : à déplacer dans `extensions` (la
supprimer puis la recréer, l'extension ne se déplace pas).
