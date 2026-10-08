-- Plan de vente — step 3: only owners delete a programme, since deleting it
-- also erases its lots, shapes, media rows and visit requests. Commercials
-- keep creating and editing programmes.

drop policy "projects: members delete" on public.projects;
create policy "projects: owners delete" on public.projects
  for delete to authenticated using ((select private.is_owner(organization_id)));
