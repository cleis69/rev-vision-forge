-- Plan de vente interactif — English version of a programme's texts.
-- The public pages exist in French (/p/…) and in English (/en/p/…). Their
-- interface is translated in the code; the promoter's own texts (description,
-- amenities, texts of the types, captions, names of the views and rooms,
-- descriptions of the lots, places) get their English version here, keyed by
-- the French text: { "en": { "<texte français>": "<English text>" } }. A text
-- without a translation is shown in French; once its French text changes, an
-- old translation is simply no longer used.

create function public.is_valid_translations(translations jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- CASE, not AND: SQL does not promise to stop at the first false condition.
  select case when jsonb_typeof(translations) = 'object' then
    not exists (select 1 from jsonb_object_keys(translations) as k where k <> 'en')
    and case when not translations ? 'en' then true
      when jsonb_typeof(translations->'en') = 'object' then
        (select count(*) from jsonb_object_keys(translations->'en')) <= 1000
        and not exists (
          select 1
          from jsonb_each(translations->'en') as e(source, target)
          where not (
            length(e.source) between 1 and 5000
            and case when jsonb_typeof(e.target) = 'string'
                  then length(btrim(e.target #>> '{}')) between 1 and 5000 else false end
          )
        )
      else false end
  else false end
$$;

alter table public.projects
  add column translations jsonb not null default '{}'::jsonb
    check (public.is_valid_translations(translations));

-- Read by the public pages with the rest of the programme (a column added at the end).
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
  p.lot_types,
  p.cover_media_id,
  p.translations
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';
