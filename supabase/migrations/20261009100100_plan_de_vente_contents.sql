-- Plan de vente interactif — contents of a programme (step 17).
-- Next to the photos: videos (MP4 or WebM, with a poster image) and documents
-- (PDF brochures). A media can belong to the programme, to a lot, or to every
-- lot of a type (lot_type, compared like the 360° tours: without case,
-- spaces tidied), for the Typologies section: its photos, its plans (kind
-- 'plan') and its brochure. The programme gets a starting price shown
-- instead of the lowest price of its lots, a phone number for visitors
-- (call, WhatsApp), the amenities of the residence [{ icon, label }] and a
-- text for each type of lot [{ name, description }], in the order of the
-- Typologies section. Shown to visitors through public_projects, for
-- published programmes only (the starting price only when prices are shown).

create function public.is_valid_amenities(amenities jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- CASE, not AND: SQL does not promise to stop at the first false condition.
  select case when jsonb_typeof(amenities) = 'array' then
    jsonb_array_length(amenities) <= 16
    and not exists (
      select 1
      from jsonb_array_elements(amenities) as a
      where not (
        jsonb_typeof(a) = 'object'
        and case when jsonb_typeof(a->'icon') = 'string'
              then (a->>'icon') ~ '^[a-z][a-z-]{0,29}$' else false end
        and case when jsonb_typeof(a->'label') = 'string'
              then length(btrim(a->>'label')) between 1 and 60 else false end
      )
    )
  else false end
$$;

create function public.is_valid_lot_types(lot_types jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(lot_types) = 'array' then
    jsonb_array_length(lot_types) <= 30
    and not exists (
      select 1
      from jsonb_array_elements(lot_types) as t
      where not (
        jsonb_typeof(t) = 'object'
        and case when jsonb_typeof(t->'name') = 'string'
              then length(btrim(t->>'name')) between 1 and 60 else false end
        and case when jsonb_typeof(t->'description') = 'string'
              then length(t->>'description') <= 1200 else false end
      )
    )
  else false end
$$;

alter table public.projects
  add column price_from numeric(14, 2) check (price_from >= 0),
  add column contact_phone text check (contact_phone ~ '^\+?[0-9][0-9 ().-]{5,29}$'),
  add column amenities jsonb not null default '[]'::jsonb check (public.is_valid_amenities(amenities)),
  add column lot_types jsonb not null default '[]'::jsonb check (public.is_valid_lot_types(lot_types));

alter table public.media
  add column lot_type text check (length(btrim(lot_type)) between 1 and 60),
  add constraint media_one_owner check (lot_id is null or lot_type is null),
  -- The images of an orbital sequence belong to their view only.
  add constraint media_orbit_owner check (
    kind not in ('orbit_frame', 'orbit_mask') or (lot_id is null and lot_type is null)
  );

-- Videos up to 50 MB (the largest file the project accepts), and PDF.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'application/pdf'
    ]
where id = 'project-media';

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
  p.places,
  case when p.show_prices then p.price_from end as price_from,
  p.contact_phone,
  p.amenities,
  p.lot_types
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';
