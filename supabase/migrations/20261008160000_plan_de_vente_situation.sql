-- Plan de vente interactif — location of a programme (Situation section).
-- Address and position of the programme, and the places nearby with the
-- time to reach them, typed by the promoter: [{ name, minutes, mode }],
-- mode "voiture" or "pied", 12 places at most. Shown to visitors through
-- public_projects, for published programmes only.

create function public.is_valid_places(places jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- CASE, not AND: SQL does not promise to stop at the first false condition.
  select case when jsonb_typeof(places) = 'array' then
    jsonb_array_length(places) <= 12
    and not exists (
      select 1
      from jsonb_array_elements(places) as p
      where not (
        jsonb_typeof(p) = 'object'
        and case when jsonb_typeof(p->'name') = 'string'
              then length(btrim(p->>'name')) between 1 and 80 else false end
        and case when jsonb_typeof(p->'minutes') = 'number'
              then (p->>'minutes')::numeric between 1 and 600
                and (p->>'minutes')::numeric = trunc((p->>'minutes')::numeric)
              else false end
        and coalesce(p->>'mode', '') in ('voiture', 'pied')
      )
    )
  else false end
$$;

alter table public.projects
  add column address text check (length(address) <= 300),
  add column latitude double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180),
  add column places jsonb not null default '[]'::jsonb check (public.is_valid_places(places)),
  add constraint projects_position_complete check ((latitude is null) = (longitude is null));

-- Same view, four more columns at the end (grants are kept).
create or replace view public.public_projects
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
  o.brand_font,
  p.address,
  p.latitude,
  p.longitude,
  p.places
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';
