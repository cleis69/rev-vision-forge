-- Plan de vente interactif — a lot sheet that sells (step 19).
-- 1. Payment plan of the programme: how a buyer pays, step by step (off-plan
--    sales, the instalments follow the works) [{ label, percent }], and a note
--    (the law that frames it, for example). The lot sheets show the amount of
--    each step.
-- 2. Rental yield: the promoter's starting values for the yield simulator of
--    the lot sheets { nightly, occupancy, charges } (rate per night in the
--    programme's currency, occupancy and charges in %). The simulator shows
--    when a rate per night is set; the buyer changes the values.
-- 3. Alerts: on a reserved or sold lot, a visitor asks to be told when it is
--    free again. Saved as a request of kind 'alerte' (submit_lead, same limits
--    as a visit request) and listed in the Demandes tab, where the team sees
--    which lots are free again and whom to call.
-- 4. Followers of each lot: how many visitors asked about it or wait for it
--    (requests of the last 90 days, one per visitor). A count only, for
--    published programmes.
-- All shown to visitors through public_projects (columns added at the end).

create function public.is_valid_payment_plan(plan jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- CASE, not AND: SQL does not promise to stop at the first false condition.
  select case when jsonb_typeof(plan) = 'array' then
    jsonb_array_length(plan) <= 12
    and not exists (
      select 1
      from jsonb_array_elements(plan) as s
      where not (
        jsonb_typeof(s) = 'object'
        and case when jsonb_typeof(s->'label') = 'string'
              then length(btrim(s->>'label')) between 1 and 80 else false end
        and case when jsonb_typeof(s->'percent') = 'number'
              then (s->>'percent')::numeric > 0 and (s->>'percent')::numeric <= 100 else false end
      )
    )
  else false end
$$;

create function public.is_valid_rental(rental jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(rental) = 'object' then
    not exists (
      select 1 from jsonb_object_keys(rental) as k
      where k not in ('nightly', 'occupancy', 'charges')
    )
    and case when not rental ? 'nightly' then true
      when jsonb_typeof(rental->'nightly') = 'number' then
        (rental->>'nightly')::numeric > 0 and (rental->>'nightly')::numeric <= 10000000
      else false end
    and case when not rental ? 'occupancy' then true
      when jsonb_typeof(rental->'occupancy') = 'number' then
        (rental->>'occupancy')::numeric between 0 and 100
      else false end
    and case when not rental ? 'charges' then true
      when jsonb_typeof(rental->'charges') = 'number' then
        (rental->>'charges')::numeric between 0 and 90
      else false end
  else false end
$$;

alter table public.projects
  add column payment_plan jsonb not null default '[]'::jsonb
    check (public.is_valid_payment_plan(payment_plan)),
  add column payment_note text check (length(payment_note) <= 300),
  add column rental jsonb not null default '{}'::jsonb
    check (public.is_valid_rental(rental));

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
  p.translations,
  p.payment_plan,
  p.payment_note,
  p.rental
from public.projects p
join public.organizations o on o.id = p.organization_id
where p.status = 'published';

-- A visit request, or an alert on a lot that is not available.
alter table public.leads
  add column kind text not null default 'visite' check (kind in ('visite', 'alerte'));

-- Same function, one more argument: the old one goes first (two versions would be ambiguous).
drop function public.submit_lead(uuid, text, text, text, uuid, text, text, text);

create function public.submit_lead(
  p_project_id uuid,
  p_nom text,
  p_telephone text,
  p_session_id text,
  p_lot_id uuid default null,
  p_email text default null,
  p_message text default null,
  p_source text default 'page',
  p_kind text default 'visite'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text;
  v_ip_hash text;
  v_lead_id uuid;
begin
  if not exists (select 1 from public.projects p where p.id = p_project_id and p.status = 'published') then
    raise exception 'Programme introuvable.' using errcode = 'P0002';
  end if;
  if p_lot_id is not null
     and not exists (select 1 from public.lots l where l.id = p_lot_id and l.project_id = p_project_id) then
    raise exception 'Lot introuvable.' using errcode = 'P0002';
  end if;
  if coalesce(p_kind, 'visite') not in ('visite', 'alerte') then
    raise exception 'Type de demande inconnu.' using errcode = '22023';
  end if;
  -- An alert waits for one lot.
  if p_kind = 'alerte' and p_lot_id is null then
    raise exception 'Lot manquant.' using errcode = '22023';
  end if;
  if nullif(trim(p_session_id), '') is null then
    raise exception 'Session manquante.' using errcode = '22023';
  end if;

  -- Visitor IP as forwarded by the API gateway; only a hash is stored.
  v_ip := coalesce(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-real-ip',
    trim(split_part(v_headers ->> 'x-forwarded-for', ',', 1))
  );
  if nullif(v_ip, '') is not null then
    v_ip_hash := encode(sha256(convert_to('rev-leads:' || v_ip, 'UTF8')), 'hex');
  end if;

  if (select count(*) from public.leads l
      where l.session_id = p_session_id and l.created_at > now() - interval '1 hour') >= 5
     or (v_ip_hash is not null and (select count(*) from public.leads l
      where l.ip_hash = v_ip_hash and l.created_at > now() - interval '1 hour') >= 20)
  then
    raise exception 'Trop de demandes envoyées. Réessayez dans une heure.'
      using errcode = 'P0001', hint = 'rate_limited';
  end if;

  insert into public.leads (project_id, lot_id, nom, telephone, email, message, source, session_id, ip_hash, kind)
  values (
    p_project_id,
    p_lot_id,
    trim(p_nom),
    trim(p_telephone),
    nullif(lower(trim(p_email)), ''),
    nullif(trim(p_message), ''),
    coalesce(p_source, 'page'),
    p_session_id,
    v_ip_hash,
    coalesce(p_kind, 'visite')
  )
  returning id into v_lead_id;

  return v_lead_id;
end
$$;

revoke execute on function public.submit_lead(uuid, text, text, text, uuid, text, text, text, text) from public;
grant execute on function public.submit_lead(uuid, text, text, text, uuid, text, text, text, text) to anon, authenticated;

-- How many visitors follow each lot: a count, never who.
create function public.lot_followers(p_project_id uuid)
returns table (lot_id uuid, followers integer)
language sql
stable
security definer
set search_path = ''
as $$
  select l.lot_id, count(distinct coalesce(l.session_id, l.id::text))::integer
  from public.leads l
  join public.projects p on p.id = l.project_id and p.status = 'published'
  where l.project_id = p_project_id
    and l.lot_id is not null
    and l.created_at > now() - interval '90 days'
  group by l.lot_id
$$;

revoke execute on function public.lot_followers(uuid) from public;
grant execute on function public.lot_followers(uuid) to anon, authenticated;
