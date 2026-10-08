-- Plan de vente interactif — row level security (step 1).
-- Members of an organization read and write everything of their organization.
-- Visitors (anon) only read published programmes, and never the `lots` table
-- itself: they go through the public_lots view, which hides prices when
-- show_prices is false. Leads are only created through public.submit_lead.

-- ---------------------------------------------------------------- helpers
-- security definer: they read members/projects without going through RLS.

create function public.is_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.organization_id = org and m.user_id = (select auth.uid())
  )
$$;

create function public.is_owner(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.organization_id = org and m.user_id = (select auth.uid()) and m.role = 'owner'
  )
$$;

create function public.can_edit_project(project uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    join public.members m on m.organization_id = p.organization_id
    where p.id = project and m.user_id = (select auth.uid())
  )
$$;

create function public.is_published(project uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.projects p where p.id = project and p.status = 'published')
$$;

-- Membership helpers are for signed-in users only.
revoke execute on function public.is_member(uuid) from public, anon;
revoke execute on function public.is_owner(uuid) from public, anon;
revoke execute on function public.can_edit_project(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.is_owner(uuid) to authenticated;
grant execute on function public.can_edit_project(uuid) to authenticated;

-- An organization always keeps at least one owner (except when it is deleted).
create function public.members_keep_an_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner' or new.organization_id <> old.organization_id)
     and exists (select 1 from public.organizations o where o.id = old.organization_id)
     and not exists (
       select 1 from public.members m
       where m.organization_id = old.organization_id and m.role = 'owner' and m.user_id <> old.user_id
     )
  then
    raise exception 'Une organisation doit garder au moins un propriétaire.' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end
$$;
create trigger members_keep_an_owner before update or delete on public.members
  for each row execute function public.members_keep_an_owner();

-- ------------------------------------------------------------- enable RLS

alter table public.organizations enable row level security;
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.lots enable row level security;
alter table public.lot_shapes enable row level security;
alter table public.media enable row level security;
alter table public.leads enable row level security;
alter table public.lot_events enable row level security;

-- Visitors never touch these tables directly.
revoke all on public.organizations, public.members, public.lots, public.leads from anon;
-- Members may only change the status of a lead.
revoke insert, update, delete on public.leads from authenticated;
grant update (status) on public.leads to authenticated;

-- ---------------------------------------------------------- organizations
-- Created through public.create_organization (which also adds the owner).

create policy "organizations: members read" on public.organizations
  for select to authenticated using ((select public.is_member(id)));
create policy "organizations: owners update" on public.organizations
  for update to authenticated
  using ((select public.is_owner(id))) with check ((select public.is_owner(id)));
create policy "organizations: owners delete" on public.organizations
  for delete to authenticated using ((select public.is_owner(id)));

-- ---------------------------------------------------------------- members

create policy "members: members read" on public.members
  for select to authenticated using ((select public.is_member(organization_id)));
create policy "members: owners add" on public.members
  for insert to authenticated with check ((select public.is_owner(organization_id)));
create policy "members: owners update" on public.members
  for update to authenticated
  using ((select public.is_owner(organization_id))) with check ((select public.is_owner(organization_id)));
create policy "members: owners remove" on public.members
  for delete to authenticated using ((select public.is_owner(organization_id)));

-- --------------------------------------------------------------- projects

create policy "projects: public reads published" on public.projects
  for select to anon, authenticated using (status = 'published');
create policy "projects: members read" on public.projects
  for select to authenticated using ((select public.is_member(organization_id)));
create policy "projects: members create" on public.projects
  for insert to authenticated with check ((select public.is_member(organization_id)));
create policy "projects: members update" on public.projects
  for update to authenticated
  using ((select public.is_member(organization_id))) with check ((select public.is_member(organization_id)));
create policy "projects: members delete" on public.projects
  for delete to authenticated using ((select public.is_member(organization_id)));

-- ------------------------------------------------------------------- lots
-- No public policy: visitors read public.public_lots.

create policy "lots: members all" on public.lots
  for all to authenticated
  using ((select public.can_edit_project(project_id))) with check ((select public.can_edit_project(project_id)));

-- ------------------------------------------------------- lot_shapes, media

create policy "lot_shapes: public reads published" on public.lot_shapes
  for select to anon, authenticated using ((select public.is_published(project_id)));
create policy "lot_shapes: members all" on public.lot_shapes
  for all to authenticated
  using ((select public.can_edit_project(project_id))) with check ((select public.can_edit_project(project_id)));

create policy "media: public reads published" on public.media
  for select to anon, authenticated using ((select public.is_published(project_id)));
create policy "media: members all" on public.media
  for all to authenticated
  using ((select public.can_edit_project(project_id))) with check ((select public.can_edit_project(project_id)));

-- ------------------------------------------------------------------ leads

create policy "leads: members read" on public.leads
  for select to authenticated using ((select public.can_edit_project(project_id)));
create policy "leads: members update status" on public.leads
  for update to authenticated
  using ((select public.can_edit_project(project_id))) with check ((select public.can_edit_project(project_id)));

-- ------------------------------------------------------------- lot_events
-- Insert without returning the row (visitors cannot read events back).

create policy "lot_events: public records on published" on public.lot_events
  for insert to anon, authenticated with check ((select public.is_published(project_id)));
create policy "lot_events: members read" on public.lot_events
  for select to authenticated using ((select public.can_edit_project(project_id)));
revoke update, delete on public.lot_events from anon, authenticated;

-- ------------------------------------------------------------ public views
-- Owned by the migration role, so they bypass RLS on purpose; they only
-- expose published programmes and the fields a visitor may see.

create view public.public_lots
with (security_invoker = false)
as
select
  l.id,
  l.project_id,
  l.numero,
  l.type,
  l.surface_habitable,
  l.surface_terrain,
  l.chambres,
  case when p.show_prices then l.prix end as prix,
  l.statut,
  l.description,
  l.features,
  l.sort_order,
  l.updated_at
from public.lots l
join public.projects p on p.id = l.project_id
where p.status = 'published';

-- Programme page with the promoter's branding (white label).
create view public.public_projects
with (security_invoker = false)
as
select
  p.id,
  p.slug,
  p.name,
  p.city,
  p.description,
  p.plan_image_path,
  p.plan_width,
  p.plan_height,
  p.show_prices,
  p.currency,
  p.updated_at,
  o.name as organization_name,
  o.slug as organization_slug,
  o.logo_path as organization_logo_path,
  o.brand_color,
  o.brand_font
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';

revoke all on public.public_lots, public.public_projects from anon, authenticated;
grant select on public.public_lots, public.public_projects to anon, authenticated;
