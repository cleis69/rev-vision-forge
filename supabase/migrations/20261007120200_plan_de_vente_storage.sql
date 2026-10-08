-- Plan de vente interactif — media storage (step 1).
-- Bucket project-media, public read. Paths: <organization_id>/<project_id>/…
-- or <organization_id>/brand/… (logo). Writing is limited to the members of
-- that organization, inside a programme of that organization.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-media', 'project-media', true, 26214400, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create function public.can_write_media(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.members m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(object_name))[1]
      and (
        (storage.foldername(object_name))[2] = 'brand'
        or exists (
          select 1 from public.projects p
          where p.organization_id = m.organization_id
            and p.id::text = (storage.foldername(object_name))[2]
        )
      )
  )
$$;
revoke execute on function public.can_write_media(text) from public, anon;
grant execute on function public.can_write_media(text) to authenticated;

create policy "project-media: members list" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-media' and (select public.can_write_media(name)));
create policy "project-media: members upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-media' and (select public.can_write_media(name)));
create policy "project-media: members replace" on storage.objects
  for update to authenticated
  using (bucket_id = 'project-media' and (select public.can_write_media(name)))
  with check (bucket_id = 'project-media' and (select public.can_write_media(name)));
create policy "project-media: members delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-media' and (select public.can_write_media(name)));
