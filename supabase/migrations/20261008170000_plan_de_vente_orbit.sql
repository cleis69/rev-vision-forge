-- Plan de vente interactif — orbital view (v2, step 11).
-- The sequence itself is in media: kind orbit_frame (the images) and
-- orbit_mask (the same views, each lot in one flat colour on black), in
-- frame order (sort_order). orbit_colors lists the colours found in the
-- masks and the lot each one stands for: lot_id is empty until the promoter
-- links the colour to a lot, and goes back to empty if that lot is deleted.

create table public.orbit_colors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  hex text not null check (hex ~ '^#[0-9a-f]{6}$'),
  -- Share of the mask pixels in this colour, over the whole sequence (0…1).
  share real not null default 0 check (share between 0 and 1),
  lot_id uuid,
  unique (project_id, hex),
  foreign key (lot_id, project_id) references public.lots (id, project_id)
    on delete set null (lot_id)
);
-- One colour per lot.
create unique index orbit_colors_lot_unique on public.orbit_colors (lot_id) where lot_id is not null;
create index orbit_colors_lot_project_idx on public.orbit_colors (lot_id, project_id);

alter table public.orbit_colors enable row level security;
revoke insert, update, delete on public.orbit_colors from anon;

create policy "orbit_colors: visitors read published" on public.orbit_colors
  for select to anon using ((select private.is_published(project_id)));
create policy "orbit_colors: signed-in read published or own" on public.orbit_colors
  for select to authenticated
  using ((select private.is_published(project_id)) or (select private.can_edit_project(project_id)));
create policy "orbit_colors: members insert" on public.orbit_colors
  for insert to authenticated with check ((select private.can_edit_project(project_id)));
create policy "orbit_colors: members update" on public.orbit_colors
  for update to authenticated
  using ((select private.can_edit_project(project_id))) with check ((select private.can_edit_project(project_id)));
create policy "orbit_colors: members delete" on public.orbit_colors
  for delete to authenticated using ((select private.can_edit_project(project_id)));
