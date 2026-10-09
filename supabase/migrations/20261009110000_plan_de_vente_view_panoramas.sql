-- Plan de vente interactif — 360° views (step 18).
-- A view of the programme (an aerial view above all) can be a 360°
-- panorama instead of an orbital sequence: the panorama in three sizes
-- (<path>, <path>-4096, <path>-640, as the 360° tours) and the direction
-- shown first; each lot it shows gets a marker where it stands (yaw and
-- pitch in radians), one per lot and per view, gone with the view or the lot.

alter table public.project_views
  add column panorama_path text check (length(panorama_path) between 1 and 300),
  add column panorama_width integer check (panorama_width > 0),
  add column panorama_height integer check (panorama_height > 0),
  add column start_yaw double precision not null default 0
    check (start_yaw >= 0 and start_yaw < 6.2832),
  add column start_pitch double precision not null default 0
    check (start_pitch between -1.5708 and 1.5708),
  add constraint project_views_panorama_complete check (
    (panorama_path is null) = (panorama_width is null)
    and (panorama_path is null) = (panorama_height is null)
  );

create table public.view_markers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  view_id uuid not null,
  lot_id uuid not null,
  yaw double precision not null check (yaw >= 0 and yaw < 6.2832),
  pitch double precision not null check (pitch between -1.5708 and 1.5708),
  unique (view_id, lot_id),
  foreign key (view_id, project_id) references public.project_views (id, project_id)
    on delete cascade,
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete cascade
);
create index view_markers_project_id_idx on public.view_markers (project_id);
create index view_markers_lot_project_idx on public.view_markers (lot_id, project_id);

alter table public.view_markers enable row level security;
revoke insert, update, delete on public.view_markers from anon;

create policy "view_markers: visitors read published" on public.view_markers
  for select to anon using ((select private.is_published(project_id)));
create policy "view_markers: signed-in read published or own" on public.view_markers
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "view_markers: members insert" on public.view_markers
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "view_markers: members update" on public.view_markers
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "view_markers: members delete" on public.view_markers
  for delete to authenticated using ((select private.can_edit_project(project_id)));
