-- Plan de vente interactif — photo d'accueil d'un programme.
-- The promoter picks the photo shown at the top of the public page and in
-- the link previews (WhatsApp…); without one, the first photo of the
-- programme is used, as before. Deleting the photo clears the choice.

alter table public.projects
  add column cover_media_id uuid references public.media (id) on delete set null;

-- The photo must be one of the programme's photos (not a plan, a video or a
-- frame of an orbital view, nor the media of another programme).
create or replace function private.check_project_cover()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.cover_media_id is not null and not exists (
    select 1
    from public.media m
    where m.id = new.cover_media_id
      and m.project_id = new.id
      and m.kind = 'image'
  ) then
    raise exception 'La photo d''accueil doit être une photo de ce programme.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.check_project_cover() from public;

create trigger projects_cover_check
  before insert or update of cover_media_id on public.projects
  for each row execute function private.check_project_cover();

-- Public pages and link previews read it from the view (a column added at the end).
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
  p.cover_media_id
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';
