-- Plan de vente interactif — several views per programme, cleanup (step 13).
-- Applied once the code reading project_views is online: the single plan of
-- the programmes is gone (it became their first view), and so are its
-- columns in public_projects.

drop view public.public_projects;
create view public.public_projects
with (security_invoker = false)
as
select
  p.id,
  p.slug,
  p.name,
  p.city,
  p.description,
  p.show_prices,
  p.currency,
  p.updated_at,
  o.name as organization_name,
  o.slug as organization_slug,
  o.logo_path as organization_logo_path,
  o.brand_color,
  o.brand_font,
  p.address,
  p.latitude,
  p.longitude,
  p.places
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';
revoke all on public.public_projects from anon, authenticated;
grant select on public.public_projects to anon, authenticated;

alter table public.projects drop column plan_image_path, drop column plan_width, drop column plan_height;
