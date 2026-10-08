-- Plan de vente interactif — several views per programme (step 13).
-- A programme has views (aerial view, roof, one plan per floor from R-1 to
-- R+n, pedestrian view…), each with its image; a lot can be traced on
-- several of them, once per view. The single plan of each programme becomes
-- its first view, "Vue aérienne", with its shapes. Lots get a floor (niveau:
-- -1 for R-1, 0 for the ground floor, 1 for R+1…).

create type public.view_kind as enum ('aerienne', 'toiture', 'niveau', 'pieton', 'autre');

create table public.project_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  kind public.view_kind not null default 'autre',
  -- Floor shown by a 'niveau' view (and only by it).
  level smallint check (level between -9 and 99),
  image_path text,
  image_width integer check (image_width > 0),
  image_height integer check (image_height > 0),
  sort_order integer not null default 0,
  -- View shown first on the public pages (none: the orbital view if any, else the first one).
  is_main boolean not null default false,
  unique (id, project_id),
  check ((kind = 'niveau') = (level is not null)),
  check ((image_path is null) = (image_width is null) and (image_path is null) = (image_height is null))
);
create index project_views_project_idx on public.project_views (project_id, sort_order);
create unique index project_views_one_main on public.project_views (project_id) where is_main;

alter table public.project_views enable row level security;
revoke insert, update, delete on public.project_views from anon;
create policy "project_views: visitors read published" on public.project_views
  for select to anon using ((select private.is_published(project_id)));
create policy "project_views: signed-in read published or own" on public.project_views
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "project_views: members insert" on public.project_views
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "project_views: members update" on public.project_views
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "project_views: members delete" on public.project_views
  for delete to authenticated using ((select private.can_edit_project(project_id)));

-- The plan of each programme becomes its first view.
insert into public.project_views (project_id, name, kind, image_path, image_width, image_height, sort_order)
select id, 'Vue aérienne', 'aerienne', plan_image_path, plan_width, plan_height, 0
from public.projects
where plan_image_path is not null;
-- Shapes without a plan image (should not exist): a view without image keeps them.
insert into public.project_views (project_id, name, kind, sort_order)
select distinct s.project_id, 'Vue aérienne', 'aerienne'::public.view_kind, 0
from public.lot_shapes s
where not exists (select 1 from public.project_views v where v.project_id = s.project_id);

-- Shapes: one per lot and per view.
alter table public.lot_shapes add column view_id uuid;
update public.lot_shapes s
set view_id = (select v.id from public.project_views v where v.project_id = s.project_id order by v.sort_order limit 1);
alter table public.lot_shapes alter column view_id set not null;
alter table public.lot_shapes drop constraint lot_shapes_lot_id_key;
alter table public.lot_shapes add constraint lot_shapes_lot_view_key unique (lot_id, view_id);
alter table public.lot_shapes
  add constraint lot_shapes_view_id_project_id_fkey foreign key (view_id, project_id)
  references public.project_views (id, project_id) on delete cascade;
create index lot_shapes_view_project_idx on public.lot_shapes (view_id, project_id);

-- Floor of a lot.
alter table public.lots add column niveau smallint check (niveau between -9 and 99);

-- Public view of the lots: with their floor.
create or replace view public.public_lots
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
  l.updated_at,
  l.niveau
from public.lots l
join public.projects p on p.id = l.project_id
where p.status = 'published';
