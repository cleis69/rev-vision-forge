-- Plan de vente interactif — 360° tours (step 14).
-- A tour is a set of equirectangular panoramas, one per room, made for one
-- lot or for every lot of one type (lots.type, compared without case or
-- surrounding spaces); its first room is the entrance. Arrows placed by the
-- promoter lead from one room to another.

create table public.panoramas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  -- The tour of one lot, or of every lot of one type.
  lot_id uuid,
  lot_type text check (length(btrim(lot_type)) between 1 and 60),
  name text not null check (length(btrim(name)) between 1 and 60),
  -- Large version (8 192 px at most); the 4 096 px one and the thumbnail sit next to it.
  image_path text not null,
  image_width integer not null check (image_width > 0),
  image_height integer not null check (image_height > 0),
  sort_order integer not null default 0,
  -- Direction shown on arrival, in radians.
  start_yaw double precision not null default 0 check (start_yaw >= 0 and start_yaw < 6.2832),
  start_pitch double precision not null default 0 check (start_pitch between -1.5708 and 1.5708),
  unique (id, project_id),
  check ((lot_id is null) <> (lot_type is null)),
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete cascade
);
create index panoramas_project_idx on public.panoramas (project_id, sort_order);
create index panoramas_lot_idx on public.panoramas (lot_id);

-- Arrow from one room to another, placed where the door is.
create table public.panorama_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null,
  from_id uuid not null,
  to_id uuid not null,
  yaw double precision not null check (yaw >= 0 and yaw < 6.2832),
  pitch double precision not null check (pitch between -1.5708 and 1.5708),
  unique (from_id, to_id),
  check (from_id <> to_id),
  foreign key (from_id, project_id) references public.panoramas (id, project_id) on delete cascade,
  foreign key (to_id, project_id) references public.panoramas (id, project_id) on delete cascade
);
create index panorama_links_project_idx on public.panorama_links (project_id);
create index panorama_links_to_idx on public.panorama_links (to_id);

-- Same rules as the views: public reading for published programmes, writing by members.
alter table public.panoramas enable row level security;
alter table public.panorama_links enable row level security;
revoke insert, update, delete on public.panoramas, public.panorama_links from anon;

create policy "panoramas: visitors read published" on public.panoramas
  for select to anon using ((select private.is_published(project_id)));
create policy "panoramas: signed-in read published or own" on public.panoramas
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "panoramas: members insert" on public.panoramas
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "panoramas: members update" on public.panoramas
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "panoramas: members delete" on public.panoramas
  for delete to authenticated using ((select private.can_edit_project(project_id)));

create policy "panorama_links: visitors read published" on public.panorama_links
  for select to anon using ((select private.is_published(project_id)));
create policy "panorama_links: signed-in read published or own" on public.panorama_links
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "panorama_links: members insert" on public.panorama_links
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "panorama_links: members update" on public.panorama_links
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "panorama_links: members delete" on public.panorama_links
  for delete to authenticated using ((select private.can_edit_project(project_id)));
