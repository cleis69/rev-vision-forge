-- Plan de vente interactif — every view is an orbital sequence (step 15).
-- The images and masks of a sequence (media orbit_frame / orbit_mask) and the
-- colour → lot links (orbit_colors) now belong to one view: aerial view, roof,
-- each floor, pedestrian view… Each view has its own links, since two floors
-- often reuse the same colours for different lots. The sequence of each
-- programme becomes the one of its aerial view. Still images and traced
-- shapes are dropped by the next migration, once the code no longer reads them.

alter table public.media add column view_id uuid;
alter table public.media
  add constraint media_view_id_project_id_fkey foreign key (view_id, project_id)
  references public.project_views (id, project_id) on delete cascade;
create index media_view_idx on public.media (view_id, sort_order);

alter table public.orbit_colors add column view_id uuid;
alter table public.orbit_colors
  add constraint orbit_colors_view_id_project_id_fkey foreign key (view_id, project_id)
  references public.project_views (id, project_id) on delete cascade;

-- The existing sequence goes to the aerial view, created when missing.
insert into public.project_views (project_id, name, kind, sort_order)
select distinct m.project_id, 'Vue aérienne', 'aerienne'::public.view_kind, 0
from public.media m
where m.kind in ('orbit_frame', 'orbit_mask')
  and not exists (
    select 1 from public.project_views v where v.project_id = m.project_id and v.kind = 'aerienne'
  );

with target as (
  select distinct on (project_id) project_id, id
  from public.project_views
  where kind = 'aerienne'
  order by project_id, sort_order, created_at
)
update public.media m
set view_id = t.id
from target t
where t.project_id = m.project_id and m.kind in ('orbit_frame', 'orbit_mask');

with target as (
  select distinct on (project_id) project_id, id
  from public.project_views
  where kind = 'aerienne'
  order by project_id, sort_order, created_at
)
update public.orbit_colors c
set view_id = t.id
from target t
where t.project_id = c.project_id;

-- Colours that no sequence uses any more (none expected) go.
delete from public.orbit_colors where view_id is null;
alter table public.orbit_colors alter column view_id set not null;

-- One colour once per view, and a lot under one colour per view.
alter table public.orbit_colors drop constraint orbit_colors_project_id_hex_key;
drop index public.orbit_colors_lot_unique;
alter table public.orbit_colors add constraint orbit_colors_view_hex_key unique (view_id, hex);
create unique index orbit_colors_view_lot_key on public.orbit_colors (view_id, lot_id)
  where lot_id is not null;
