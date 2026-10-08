-- Plan de vente interactif — database advisor fixes (step 1).

-- 1. The RLS helpers move to a private schema, out of the public API (/rpc).
--    Policies point to the functions themselves, so they keep working.
create schema private;
grant usage on schema private to anon, authenticated;
alter function public.is_member(uuid) set schema private;
alter function public.is_owner(uuid) set schema private;
alter function public.can_edit_project(uuid) set schema private;
alter function public.is_published(uuid) set schema private;
alter function public.can_write_media(text) set schema private;
alter function public.members_keep_an_owner() set schema private;
revoke execute on function private.members_keep_an_owner() from public, anon, authenticated;

-- 2. One SELECT policy per role and table (members also see their drafts).
drop policy "projects: public reads published" on public.projects;
drop policy "projects: members read" on public.projects;
create policy "projects: visitors read published" on public.projects
  for select to anon using (status = 'published');
create policy "projects: signed-in read published or own" on public.projects
  for select to authenticated
  using (status = 'published' or (select private.is_member(organization_id)));

drop policy "lot_shapes: public reads published" on public.lot_shapes;
drop policy "lot_shapes: members all" on public.lot_shapes;
create policy "lot_shapes: visitors read published" on public.lot_shapes
  for select to anon using ((select private.is_published(project_id)));
create policy "lot_shapes: signed-in read published or own" on public.lot_shapes
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "lot_shapes: members insert" on public.lot_shapes
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "lot_shapes: members update" on public.lot_shapes
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "lot_shapes: members delete" on public.lot_shapes
  for delete to authenticated using ((select private.can_edit_project(project_id)));

drop policy "media: public reads published" on public.media;
drop policy "media: members all" on public.media;
create policy "media: visitors read published" on public.media
  for select to anon using ((select private.is_published(project_id)));
create policy "media: signed-in read published or own" on public.media
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "media: members insert" on public.media
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "media: members update" on public.media
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "media: members delete" on public.media
  for delete to authenticated using ((select private.can_edit_project(project_id)));

-- 3. Indexes covering the composite (lot_id, project_id) foreign keys.
drop index public.media_lot_id_idx;
drop index public.leads_lot_id_idx;
drop index public.lot_events_lot_id_idx;
create index media_lot_project_idx on public.media (lot_id, project_id);
create index leads_lot_project_idx on public.leads (lot_id, project_id);
create index lot_events_lot_project_idx on public.lot_events (lot_id, project_id);
create index lot_shapes_lot_project_idx on public.lot_shapes (lot_id, project_id);
