-- Security tests for the plan de vente schema (RLS, grants, functions).
-- Run as the migration role (SQL editor, `psql`, or the Supabase MCP):
-- everything happens in one statement that always ends with an exception,
-- so the test data is rolled back and nothing is left in the database.
-- The exception message is the report: "RLS TESTS PASSED n/n" or the
-- list of failures.

do $tests$
declare
  owner_a constant uuid := '00000000-0000-4000-8000-0000000000a1';
  commercial_a constant uuid := '00000000-0000-4000-8000-0000000000a2';
  owner_b constant uuid := '00000000-0000-4000-8000-0000000000b1';
  org_a constant uuid := '00000000-0000-4000-8000-00000000a000';
  org_b constant uuid := '00000000-0000-4000-8000-00000000b000';
  p_pub constant uuid := '00000000-0000-4000-8000-0000000a0001';
  p_draft constant uuid := '00000000-0000-4000-8000-0000000a0002';
  p_other constant uuid := '00000000-0000-4000-8000-0000000b0001';
  lot_pub constant uuid := '00000000-0000-4000-8000-000000a00001';
  lot_draft constant uuid := '00000000-0000-4000-8000-000000a00002';
  lot_other constant uuid := '00000000-0000-4000-8000-000000b00001';
  view_pub constant uuid := '00000000-0000-4000-8000-00000a000001';
  view_rdc constant uuid := '00000000-0000-4000-8000-00000a000002';
  view_draft constant uuid := '00000000-0000-4000-8000-00000a000003';
  view_other constant uuid := '00000000-0000-4000-8000-00000b000001';
  pano_entree constant uuid := '00000000-0000-4000-8000-0000000c0001';
  pano_salon constant uuid := '00000000-0000-4000-8000-0000000c0002';
  pano_lot constant uuid := '00000000-0000-4000-8000-0000000c0003';
  pano_draft constant uuid := '00000000-0000-4000-8000-0000000c0004';
  pano_other constant uuid := '00000000-0000-4000-8000-0000000d0001';
  report text[] := '{}';
  total int := 0;
  failed int := 0;
  ok boolean;
  n int;
  v numeric;
  new_org public.organizations;
  stats jsonb;
  leads_pub int;
  leads_lot int;
begin
  ------------------------------------------------------------------ fixtures
  insert into auth.users (id, email) values
    (owner_a, 'owner-a@rls.test'), (commercial_a, 'commercial-a@rls.test'), (owner_b, 'owner-b@rls.test');
  insert into public.organizations (id, name, slug) values
    (org_a, 'Org A', 'rls-test-org-a'), (org_b, 'Org B', 'rls-test-org-b');
  insert into public.members (organization_id, user_id, role) values
    (org_a, owner_a, 'owner'), (org_a, commercial_a, 'commercial'), (org_b, owner_b, 'owner');
  insert into public.projects (id, organization_id, name, slug, status, show_prices, address, latitude, longitude, places) values
    (p_pub, org_a, 'Publié sans prix', 'rls-test-publie', 'published', false,
     'Route de test', 31.6, -7.9, '[{"name": "Aéroport", "minutes": 15, "mode": "voiture"}]'),
    (p_draft, org_a, 'Brouillon', 'rls-test-brouillon', 'draft', true, null, null, null, '[]'),
    (p_other, org_b, 'Publié avec prix', 'rls-test-autre', 'published', true, null, null, null, '[]');
  insert into public.lots (id, project_id, numero, prix, niveau) values
    (lot_pub, p_pub, '1', 1000000, 0), (lot_draft, p_draft, '1', 500000, null), (lot_other, p_other, '1', 900000, null);
  insert into public.project_views (id, project_id, name, kind, level, sort_order) values
    (view_pub, p_pub, 'Vue aérienne', 'aerienne', null, 0), (view_rdc, p_pub, 'RDC', 'niveau', 0, 1),
    (view_draft, p_draft, 'Vue aérienne', 'aerienne', null, 0), (view_other, p_other, 'Vue aérienne', 'aerienne', null, 0);
  insert into public.lot_shapes (lot_id, project_id, view_id, points) values
    (lot_pub, p_pub, view_pub, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
  insert into public.leads (project_id, lot_id, nom, telephone, session_id) values
    (p_pub, lot_pub, 'Fixture', '+212600000000', 'fixture');
  -- A tour for the type "Villa" (two rooms, one arrow), one for lot_pub, one in the draft.
  insert into public.panoramas (id, project_id, lot_id, lot_type, name, image_path, image_width, image_height, sort_order) values
    (pano_entree, p_pub, null, 'Villa', 'Entrée', 'fixture/entree.webp', 8192, 4096, 0),
    (pano_salon, p_pub, null, 'Villa', 'Salon', 'fixture/salon.webp', 8192, 4096, 1),
    (pano_lot, p_pub, lot_pub, null, 'Suite', 'fixture/suite.webp', 8192, 4096, 0),
    (pano_draft, p_draft, lot_draft, null, 'Brouillon', 'fixture/brouillon.webp', 8192, 4096, 0),
    (pano_other, p_other, null, 'Villa', 'Ailleurs', 'fixture/ailleurs.webp', 8192, 4096, 0);
  insert into public.panorama_links (project_id, from_id, to_id, yaw, pitch) values
    (p_pub, pano_entree, pano_salon, 1.5, -0.2);
  insert into public.media (project_id, lot_id, kind, path) values
    (p_pub, lot_pub, 'image', 'fixture/pub.webp'), (p_draft, null, 'image', 'fixture/draft.webp');
  insert into public.orbit_colors (project_id, view_id, hex, share, lot_id) values
    (p_pub, view_pub, '#ff0000', 0.1, lot_pub), (p_draft, view_draft, '#00ff00', 0.1, lot_draft);
  insert into public.media (project_id, view_id, kind, path, sort_order) values
    (p_pub, view_pub, 'orbit_frame', 'fixture/orbit/vue-001.webp', 0),
    (p_pub, view_pub, 'orbit_mask', 'fixture/orbit/masque-001.png', 0),
    (p_pub, view_rdc, 'orbit_frame', 'fixture/orbit-rdc/vue-001.webp', 0);
  -- Visits for the statistics: today, 10 days ago (previous week), 40 days ago.
  insert into public.lot_events (project_id, lot_id, type, session_id, created_at) values
    (p_pub, null, 'vue_page', 'stat-a', now()),
    (p_pub, lot_pub, 'vue_lot', 'stat-a', now()),
    (p_pub, lot_pub, 'clic_lot', 'stat-b', now()),
    (p_pub, null, 'vue_page', 'stat-c', now() - interval '10 days'),
    (p_pub, null, 'vue_page', 'stat-d', now() - interval '40 days');

  ---------------------------------------------------------------- visitor
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);

  set local role anon;
  begin perform 1 from public.leads; ok := not found;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : lit les demandes'::text; end if;

  set local role anon;
  begin
    insert into public.leads (project_id, nom, telephone) values (p_pub, 'Spam', '+212600000001');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : insère une demande sans passer par submit_lead'::text; end if;

  set local role anon;
  begin update public.lots set prix = 1 where id = lot_pub; get diagnostics n = row_count; ok := n = 0;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : modifie un lot'::text; end if;

  set local role anon;
  begin delete from public.lots where id = lot_pub; get diagnostics n = row_count; ok := n = 0;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : supprime un lot'::text; end if;

  set local role anon;
  begin perform 1 from public.lots; ok := not found;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : lit la table lots (prix)'::text; end if;

  set local role anon;
  select count(*) into n from public.public_lots where id = lot_pub and prix is null;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : prix masqué absent de public_lots'::text; end if;

  set local role anon;
  select prix into v from public.public_lots where id = lot_other;
  reset role;
  total := total + 1; if v is distinct from 900000 then failed := failed + 1; report := report || 'visiteur : prix affiché absent de public_lots'::text; end if;

  set local role anon;
  select count(*) into n from public.public_lots where id = lot_draft;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'visiteur : voit un lot de brouillon'::text; end if;

  set local role anon;
  select count(*) into n from public.projects where id in (p_pub, p_draft);
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : voit un programme en brouillon'::text; end if;

  set local role anon;
  select count(*) into n from public.lot_shapes where project_id = p_pub;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : ne voit pas les formes publiées'::text; end if;

  set local role anon;
  begin perform 1 from public.organizations; ok := not found;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : lit les organisations'::text; end if;

  set local role anon;
  select count(*) into n from public.public_projects where id = p_pub and organization_name = 'Org A';
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : marque absente de public_projects'::text; end if;

  set local role anon;
  begin
    insert into public.lot_events (project_id, lot_id, type, session_id) values (p_pub, lot_pub, 'vue_lot', 's1');
    ok := true;
  exception when others then ok := false; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : ne peut pas enregistrer une vue'::text; end if;

  set local role anon;
  begin
    insert into public.lot_events (project_id, type, session_id) values (p_draft, 'vue_page', 's1');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : enregistre une vue sur un brouillon'::text; end if;

  set local role anon;
  begin perform public.submit_lead(p_pub, 'Visiteur', '+212600000002', 'session-anon', lot_pub); ok := true;
  exception when others then ok := false; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : submit_lead refusé sur un programme publié'::text; end if;

  set local role anon;
  begin perform public.submit_lead(p_draft, 'Visiteur', '+212600000002', 'session-anon'); ok := false;
  exception when others then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : submit_lead accepté sur un brouillon'::text; end if;

  set local role anon;
  begin
    for i in 1..4 loop
      perform public.submit_lead(p_pub, 'Visiteur', '+212600000002', 'session-anon');
    end loop;
    begin
      perform public.submit_lead(p_pub, 'Visiteur', '+212600000002', 'session-anon');
      ok := false;
    exception when others then ok := sqlerrm like 'Trop de demandes%';
    end;
  exception when others then ok := false; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : 6e demande dans l''heure acceptée'::text; end if;

  set local role anon;
  begin perform public.create_organization('Pirate', 'rls-test-pirate'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : crée une organisation'::text; end if;

  set local role anon;
  begin
    insert into storage.objects (bucket_id, name) values ('project-media', org_a || '/' || p_pub || '/x.webp');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : téléverse un fichier'::text; end if;

  set local role anon;
  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_draft, p_draft, view_draft, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : trace une forme'::text; end if;

  set local role anon;
  select count(*) into n from public.media where project_id in (p_pub, p_draft) and kind = 'image';
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : photos d''un brouillon visibles (ou celles du publié absentes)'::text; end if;

  set local role anon;
  select count(*) into n from public.public_projects where id = p_draft;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'visiteur : brouillon présent dans public_projects'::text; end if;

  set local role anon;
  begin insert into public.media (project_id, kind, path) values (p_pub, 'image', 'pirate.webp'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : ajoute une photo'::text; end if;

  set local role anon;
  select private.can_listen('programme:' || p_pub) and not private.can_listen('programme:' || p_draft) into ok;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : écoute un brouillon en direct (ou pas le publié)'::text; end if;

  set local role anon;
  begin
    insert into realtime.messages (topic, extension, event, payload, private)
      values ('programme:' || p_pub, 'broadcast', 'lot', '{"faux": true}', true);
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : envoie un faux signal sur le canal'::text; end if;

  set local role anon;
  select count(*) into n from public.public_projects
    where id = p_pub and address = 'Route de test' and latitude = 31.6 and jsonb_array_length(places) = 1;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : situation absente de public_projects'::text; end if;

  set local role anon;
  select count(*) into n from public.orbit_colors where project_id in (p_pub, p_draft);
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : couleurs orbitales d''un brouillon visibles (ou celles du publié absentes)'::text; end if;

  set local role anon;
  begin insert into public.orbit_colors (project_id, view_id, hex) values (p_pub, view_pub, '#0000ff'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : ajoute une couleur orbitale'::text; end if;

  set local role anon;
  select count(*) into n from public.project_views where project_id in (p_pub, p_draft);
  reset role;
  total := total + 1; if n <> 2 then failed := failed + 1; report := report || 'visiteur : vues d''un brouillon visibles (ou celles du publié absentes)'::text; end if;

  set local role anon;
  begin insert into public.project_views (project_id, name) values (p_pub, 'Pirate'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : ajoute une vue'::text; end if;

  set local role anon;
  select count(*) into n from public.public_lots where id = lot_pub and niveau = 0;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'visiteur : niveau absent de public_lots'::text; end if;

  set local role anon;
  select (select count(*) from public.panoramas where project_id in (p_pub, p_draft))
       + (select count(*) from public.panorama_links where project_id = p_pub) * 10
    into n;
  reset role;
  total := total + 1; if n <> 13 then failed := failed + 1; report := report || 'visiteur : visites 360° d''un brouillon visibles (ou celles du publié absentes)'::text; end if;

  set local role anon;
  begin
    insert into public.panoramas (project_id, lot_type, name, image_path, image_width, image_height)
      values (p_pub, 'Villa', 'Pirate', 'pirate.webp', 8192, 4096);
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : ajoute une pièce à une visite'::text; end if;

  set local role anon;
  begin delete from public.panorama_links where project_id = p_pub; get diagnostics n = row_count; ok := n = 0;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : supprime un passage'::text; end if;

  set local role anon;
  begin perform public.project_stats(p_pub, 7, 'UTC'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'visiteur : lit les statistiques'::text; end if;

  ------------------------------------------- signed in, other organization
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', owner_b::text, true);

  set local role authenticated;
  select count(*) into n from public.leads where project_id = p_pub;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : lit les demandes'::text; end if;

  set local role authenticated;
  update public.lots set prix = 1 where id = lot_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : modifie un lot'::text; end if;

  set local role authenticated;
  select count(*) into n from public.projects where id = p_draft;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : voit un brouillon'::text; end if;

  set local role authenticated;
  select count(*) into n from public.organizations where id = org_a;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : lit l''organisation A'::text; end if;

  set local role authenticated;
  begin
    insert into storage.objects (bucket_id, name) values ('project-media', org_a || '/' || p_pub || '/x.webp');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : téléverse chez A'::text; end if;

  set local role authenticated;
  begin insert into public.lots (project_id, numero) values (p_pub, '99'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : ajoute un lot chez A'::text; end if;

  set local role authenticated;
  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_draft, p_draft, view_draft, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : trace une forme chez A'::text; end if;

  set local role authenticated;
  select private.can_write_media(org_a || '/' || p_pub || '/plan/plan.webp') into ok;
  reset role;
  total := total + 1; if ok then failed := failed + 1; report := report || 'autre organisation : peut remplacer ou supprimer le plan de A'::text; end if;

  set local role authenticated;
  select private.can_listen('programme:' || p_draft) into ok;
  reset role;
  total := total + 1; if ok then failed := failed + 1; report := report || 'autre organisation : écoute le brouillon de A'::text; end if;

  set local role authenticated;
  begin
    insert into storage.objects (bucket_id, name) values ('project-media', org_b || '/' || p_other || '/plan.webp');
    ok := true;
  exception when others then ok := false; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'membre : ne peut pas téléverser dans son programme'::text; end if;

  set local role authenticated;
  begin perform public.project_stats(p_pub, 7, 'UTC'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : lit les statistiques'::text; end if;

  set local role authenticated;
  update public.orbit_colors set lot_id = null where project_id = p_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : modifie une couleur orbitale'::text; end if;

  set local role authenticated;
  update public.project_views set is_main = true where id = view_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : modifie une vue de A'::text; end if;

  set local role authenticated;
  begin insert into public.project_views (project_id, name) values (p_pub, 'Intruse'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : ajoute une vue chez A'::text; end if;

  set local role authenticated;
  select count(*) into n from public.project_views where project_id = p_draft;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : voit les vues du brouillon de A'::text; end if;

  set local role authenticated;
  update public.panoramas set name = 'Piratée' where project_id = p_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : renomme une pièce de A'::text; end if;

  set local role authenticated;
  begin
    insert into public.panorama_links (project_id, from_id, to_id, yaw, pitch) values (p_pub, pano_salon, pano_entree, 0, 0);
    ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'autre organisation : ajoute un passage chez A'::text; end if;

  set local role authenticated;
  select count(*) into n from public.panoramas where project_id = p_draft;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'autre organisation : voit la visite du brouillon de A'::text; end if;

  ------------------------------------------------------ commercial of A
  perform set_config('request.jwt.claims', json_build_object('sub', commercial_a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', commercial_a::text, true);

  -- Today: the visitor's lot view (s1), stat-a and stat-b; the requests made so far.
  select count(*), count(*) filter (where lot_id = lot_pub) into leads_pub, leads_lot
    from public.leads where project_id = p_pub;
  set local role authenticated;
  stats := public.project_stats(p_pub, 7, 'Africa/Casablanca');
  reset role;
  total := total + 1;
  if (stats->'totals'->>'visites')::int <> 3 or (stats->'totals'->>'vues_lot')::int <> 2
     or (stats->'totals'->>'clics_lot')::int <> 1 or (stats->'totals'->>'demandes')::int <> leads_pub
     or (stats->'previous'->>'visites')::int <> 1 or jsonb_array_length(stats->'daily') <> 7
     or (stats->'sources'->>'page')::int <> leads_pub or leads_pub = 0 then
    failed := failed + 1; report := report || ('statistiques 7 jours fausses : ' || stats::text);
  end if;
  total := total + 1;
  if not exists (
    select 1 from jsonb_array_elements(stats->'lots') l
    where l->>'lot_id' = lot_pub::text and (l->>'vues')::int = 2 and (l->>'clics')::int = 1
      and (l->>'demandes')::int = leads_lot
  ) then
    failed := failed + 1; report := report || ('statistiques par lot fausses : ' || (stats->'lots')::text);
  end if;

  set local role authenticated;
  stats := public.project_stats(p_pub, 30, 'pas/un-fuseau');
  reset role;
  total := total + 1;
  if (stats->'totals'->>'visites')::int <> 4 or (stats->'previous'->>'visites')::int <> 1
     or stats->>'tz' <> 'UTC' or jsonb_array_length(stats->'daily') <> 30 then
    failed := failed + 1; report := report || ('statistiques 30 jours fausses : ' || stats::text);
  end if;

  set local role authenticated;
  begin perform public.project_stats(p_pub, 0, 'UTC'); ok := false;
  exception when invalid_parameter_value then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'statistiques : période invalide acceptée'::text; end if;

  set local role authenticated;
  update public.lots set statut = 'reservee' where id = lot_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas changer un statut'::text; end if;

  set local role authenticated;
  update public.orbit_colors set share = 0.2 where project_id = p_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas régler les couleurs orbitales'::text; end if;

  set local role authenticated;
  update public.leads set status = 'traite' where project_id = p_pub; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n < 1 then failed := failed + 1; report := report || 'commercial : ne peut pas traiter une demande'::text; end if;

  set local role authenticated;
  begin update public.leads set nom = 'Modifié' where project_id = p_pub; ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'commercial : modifie le contenu d''une demande'::text; end if;

  set local role authenticated;
  begin insert into public.members (organization_id, user_id) values (org_a, owner_b); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'commercial : ajoute un membre'::text; end if;

  set local role authenticated;
  update public.organizations set name = 'Renommée' where id = org_a; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'commercial : modifie l''organisation'::text; end if;

  set local role authenticated;
  insert into public.projects (organization_id, name, slug) values (org_a, 'Créé par le commercial', 'rls-test-commercial');
  get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas créer de programme'::text; end if;

  set local role authenticated;
  update public.projects set city = 'Marrakech' where id = p_draft; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas modifier un programme'::text; end if;

  set local role authenticated;
  delete from public.projects where id = p_draft; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'commercial : supprime un programme'::text; end if;

  set local role authenticated;
  delete from public.organizations where id = org_a; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'commercial : supprime l''organisation'::text; end if;

  set local role authenticated;
  insert into public.lots (project_id, numero) values (p_pub, '2'); get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas ajouter de lot'::text; end if;

  set local role authenticated;
  delete from public.lots where project_id = p_pub and numero = '2'; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas supprimer un lot'::text; end if;

  set local role authenticated;
  insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_pub, p_pub, view_pub, '[[0.5, 0.5], [0.6, 0.5], [0.6, 0.6]]')
    on conflict (lot_id, view_id) do update set points = excluded.points;
  get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas modifier une forme'::text; end if;

  set local role authenticated;
  select private.can_write_media(org_a || '/' || p_pub || '/plan/plan.webp') into ok;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'commercial : ne peut pas gérer le plan de son programme'::text; end if;

  set local role authenticated;
  insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_pub, p_pub, view_rdc, '[[0.3, 0.3], [0.4, 0.3], [0.4, 0.4]]');
  select count(*) into n from public.lot_shapes where lot_id = lot_pub;
  reset role;
  total := total + 1; if n <> 2 then failed := failed + 1; report := report || 'commercial : ne peut pas tracer un lot sur une deuxième vue'::text; end if;

  set local role authenticated;
  insert into public.project_views (project_id, name, kind, level, sort_order) values (p_pub, 'R+1', 'niveau', 1, 2);
  update public.project_views set is_main = true where id = view_rdc; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas ajouter une vue ou choisir la vue principale'::text; end if;

  set local role authenticated;
  delete from public.project_views where project_id = p_pub and name = 'R+1'; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas supprimer une vue'::text; end if;

  set local role authenticated;
  insert into public.panoramas (project_id, lot_type, name, image_path, image_width, image_height, sort_order)
    values (p_pub, 'Villa', 'Cuisine', 'fixture/cuisine.webp', 8192, 4096, 2);
  update public.panoramas set start_yaw = 3.1, start_pitch = -0.1 where id = pano_salon;
  insert into public.panorama_links (project_id, from_id, to_id, yaw, pitch) values (p_pub, pano_salon, pano_entree, 4.7, -0.3);
  select count(*) into n from public.panorama_links where project_id = p_pub;
  reset role;
  total := total + 1; if n <> 2 then failed := failed + 1; report := report || 'commercial : ne peut pas compléter une visite 360°'::text; end if;

  set local role authenticated;
  delete from public.panorama_links where from_id = pano_salon; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas supprimer un passage'::text; end if;

  set local role authenticated;
  update public.media set meta = '{"caption": "Vue mer"}' where project_id = p_pub and kind = 'image'; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne peut pas légender une photo'::text; end if;

  set local role authenticated;
  select count(*) into n from public.media where project_id = p_draft;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'commercial : ne voit pas les photos de son brouillon'::text; end if;

  set local role authenticated;
  select private.can_listen('programme:' || p_draft) into ok;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'commercial : n''écoute pas son brouillon en direct'::text; end if;

  set local role authenticated;
  begin update public.leads set notified_at = now() where project_id = p_pub; ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'commercial : modifie la date de notification d''une demande'::text; end if;

  ---------------------------------------------------------- owner of A
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', owner_a::text, true);

  set local role authenticated;
  begin delete from public.members where organization_id = org_a and user_id = owner_a; ok := false;
  exception when raise_exception then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'propriétaire : retire le dernier propriétaire'::text; end if;

  set local role authenticated;
  select * into new_org from public.create_organization('Nouvelle', 'rls-test-nouvelle');
  select count(*) into n from public.members where organization_id = new_org.id and user_id = owner_a and role = 'owner';
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'create_organization : le créateur n''est pas propriétaire'::text; end if;

  set local role authenticated;
  update public.organizations set name = 'Org A renommée', slug = 'rls-test-org-a2' where id = org_a; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'propriétaire : ne peut pas modifier son organisation'::text; end if;

  set local role authenticated;
  begin insert into public.projects (organization_id, name, slug) values (org_b, 'Intrus', 'rls-test-intrus'); ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'propriétaire : crée un programme dans une autre organisation'::text; end if;

  set local role authenticated;
  begin update public.projects set organization_id = org_b where id = p_draft; ok := false;
  exception when insufficient_privilege then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'propriétaire : déplace un programme vers une autre organisation'::text; end if;

  set local role authenticated;
  begin insert into public.projects (organization_id, name, slug) values (org_a, 'Doublon', 'rls-test-autre'); ok := false;
  exception when unique_violation then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'adresse de programme en double acceptée'::text; end if;

  set local role authenticated;
  begin perform public.create_organization('Doublon', 'rls-test-org-b'); ok := false;
  exception when unique_violation then ok := true; end;
  reset role;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'adresse d''organisation en double acceptée'::text; end if;

  set local role authenticated;
  delete from public.projects where id = p_draft; get diagnostics n = row_count;
  reset role;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'propriétaire : ne peut pas supprimer un programme'::text; end if;

  set local role authenticated;
  insert into public.lots (project_id, numero, prix) values (p_pub, '1', 1234)
    on conflict (project_id, numero) do update set prix = excluded.prix;
  select count(*) into n from public.lots where project_id = p_pub and numero = '1';
  select prix into v from public.lots where project_id = p_pub and numero = '1';
  reset role;
  total := total + 1; if n <> 1 or v is distinct from 1234 then failed := failed + 1; report := report || 'import : le lot existant n''est pas mis à jour'::text; end if;

  ------------------------------------------------------------- integrity
  begin
    update public.projects set places = '[{"name": "Golf", "minutes": "cinq", "mode": "voiture"}]' where id = p_pub;
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'lieu proche invalide accepté'::text; end if;

  begin
    update public.projects set latitude = 31.6, longitude = null where id = p_pub;
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'position incomplète acceptée'::text; end if;

  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_other, p_other, view_other, '[[1.5, 0], [0, 0], [0, 1]]');
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'forme hors du plan acceptée'::text; end if;

  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_other, p_pub, view_pub, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
    ok := false;
  exception when foreign_key_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'forme rattachée au mauvais programme'::text; end if;

  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_other, p_other, view_pub, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
    ok := false;
  exception when foreign_key_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'forme posée sur la vue d''un autre programme'::text; end if;

  begin
    insert into public.lot_shapes (lot_id, project_id, view_id, points) values (lot_pub, p_pub, view_pub, '[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]');
    ok := false;
  exception when unique_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'deux formes du même lot sur une vue'::text; end if;

  begin
    update public.project_views set is_main = true where id = view_pub;
    ok := false;
  exception when unique_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'deux vues principales acceptées'::text; end if;

  begin
    insert into public.project_views (project_id, name, kind) values (p_pub, 'Étage', 'niveau');
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'vue de niveau sans niveau acceptée'::text; end if;

  begin
    update public.lots set niveau = 120 where id = lot_pub;
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'niveau hors limites accepté'::text; end if;

  begin
    -- The same colour means another lot on another view; the same lot on two views.
    insert into public.orbit_colors (project_id, view_id, hex, share, lot_id) values
      (p_pub, view_rdc, '#ff0000', 0.1, null), (p_pub, view_rdc, '#00ff00', 0.1, lot_pub);
    ok := true;
  exception when others then ok := false; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'couleurs par vue refusées (même couleur ou même lot sur deux vues)'::text; end if;

  begin
    update public.orbit_colors set lot_id = lot_pub where view_id = view_rdc and hex = '#ff0000';
    ok := false;
  exception when unique_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'un lot sous deux couleurs d''une même vue accepté'::text; end if;

  begin
    insert into public.media (project_id, view_id, kind, path) values (p_other, view_pub, 'orbit_frame', 'x.webp');
    ok := false;
  exception when foreign_key_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'séquence posée sur la vue d''un autre programme'::text; end if;

  delete from public.project_views where id = view_rdc;
  select (select count(*) from public.lot_shapes where view_id = view_rdc)
       + (select count(*) from public.media where view_id = view_rdc)
       + (select count(*) from public.orbit_colors where view_id = view_rdc)
    into n;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'suppression d''une vue : formes, séquence ou couleurs restantes'::text; end if;

  begin
    insert into public.panoramas (project_id, lot_id, lot_type, name, image_path, image_width, image_height)
      values (p_pub, lot_pub, 'Villa', 'Les deux', 'x.webp', 8192, 4096);
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'pièce rattachée à un lot et à un type acceptée'::text; end if;

  begin
    insert into public.panoramas (project_id, name, image_path, image_width, image_height)
      values (p_pub, 'Aucun', 'x.webp', 8192, 4096);
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'pièce rattachée à rien acceptée'::text; end if;

  begin
    insert into public.panorama_links (project_id, from_id, to_id, yaw, pitch) values (p_pub, pano_entree, pano_entree, 0, 0);
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'passage d''une pièce vers elle-même accepté'::text; end if;

  begin
    insert into public.panorama_links (project_id, from_id, to_id, yaw, pitch) values (p_pub, pano_entree, pano_other, 0, 0);
    ok := false;
  exception when foreign_key_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'passage vers la pièce d''un autre programme accepté'::text; end if;

  begin
    update public.panoramas set start_yaw = 7 where id = pano_entree;
    ok := false;
  exception when check_violation then ok := true; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'vue de départ hors limites acceptée'::text; end if;

  delete from public.panoramas where id = pano_salon;
  select count(*) into n from public.panorama_links where from_id = pano_salon or to_id = pano_salon;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'suppression d''une pièce : passages restants'::text; end if;

  select count(*) into n from net.http_request_queue where url like '%/functions/v1/notify-lead';
  insert into public.leads (project_id, nom, telephone, session_id) values (p_pub, 'Notification', '+212600000009', 'notif');
  select count(*) - n into n from net.http_request_queue where url like '%/functions/v1/notify-lead';
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'nouvelle demande sans appel de notification'::text; end if;
  select count(*) into n from realtime.messages where topic = 'programme:' || p_pub and payload->>'statut' = 'vendue';
  update public.lots set statut = 'vendue' where id = lot_pub;
  select count(*) - n into n from realtime.messages where topic = 'programme:' || p_pub and payload->>'statut' = 'vendue';
  total := total + 1; if n < 1 then failed := failed + 1; report := report || 'changement de statut sans signal en direct'::text; end if;
  delete from public.lots where id = lot_pub;
  select count(*) into n from public.leads where project_id = p_pub and lot_id is null and nom = 'Fixture';
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'suppression d''un lot : demande perdue'::text; end if;
  select count(*) into n from public.orbit_colors where project_id = p_pub and hex = '#ff0000' and lot_id is null;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'suppression d''un lot : couleur orbitale perdue'::text; end if;
  select (select count(*) from public.panoramas where id = pano_lot) * 10
       + (select count(*) from public.panoramas where id = pano_entree)
    into n;
  total := total + 1; if n <> 1 then failed := failed + 1; report := report || 'suppression d''un lot : sa visite reste, ou celle de son type est perdue'::text; end if;

  begin delete from public.organizations where id = org_b; ok := true;
  exception when others then ok := false; end;
  total := total + 1; if not ok then failed := failed + 1; report := report || 'suppression d''une organisation bloquée'::text; end if;

  select (select count(*) from public.projects where organization_id = org_b)
       + (select count(*) from public.lots where id = lot_other)
       + (select count(*) from public.project_views where id = view_other)
       + (select count(*) from public.members where organization_id = org_b)
    into n;
  total := total + 1; if n <> 0 then failed := failed + 1; report := report || 'suppression d''une organisation : programmes, lots ou membres restants'::text; end if;

  ---------------------------------------------------------------- report
  if failed = 0 then
    raise exception 'RLS TESTS PASSED %/%', total, total;
  end if;
  raise exception 'RLS TESTS FAILED %/%: %', failed, total, array_to_string(report, ' | ');
end
$tests$;
