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
- Fichiers : bucket `project-media`, lecture publique, chemins
  `<organization_id>/<project_id>/…` ou `<organization_id>/brand/…`, écriture réservée
  aux membres de l'organisation.

Audit de sécurité Supabase : il signale `public_lots` et `public_projects`
(« security definer view »), ainsi que `submit_lead` et `create_organization`
appelables par l'API. C'est voulu : ce sont les seules portes d'entrée publiques,
et elles ne laissent passer que ce qui est permis.
