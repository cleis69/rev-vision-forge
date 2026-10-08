-- Plan de vente interactif — every view is orbital, cleanup (step 15).
-- Applied once the code no longer reads them: the still images of the views
-- and the shapes traced on them go (their files are removed by the promoter
-- space). A sequence always belongs to a view.

drop table public.lot_shapes;
drop function public.is_normalized_polygon(jsonb);

alter table public.project_views
  drop column image_path,
  drop column image_width,
  drop column image_height;

alter table public.media
  add constraint media_orbit_view check ((kind in ('orbit_frame', 'orbit_mask')) = (view_id is not null));
