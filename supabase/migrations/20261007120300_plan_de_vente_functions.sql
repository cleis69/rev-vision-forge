-- Plan de vente interactif — API functions (step 1).

-- Creates an organization and makes the caller its owner, in one step (the
-- caller is not a member yet, so RLS could not let them do it in two).
create function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  org public.organizations;
begin
  if (select auth.uid()) is null then
    raise exception 'Connexion requise.' using errcode = '42501';
  end if;
  insert into public.organizations (name, slug)
  values (trim(p_name), lower(trim(p_slug)))
  returning * into org;
  insert into public.members (organization_id, user_id, role)
  values (org.id, (select auth.uid()), 'owner');
  return org;
end
$$;
revoke execute on function public.create_organization(text, text) from public, anon;
grant execute on function public.create_organization(text, text) to authenticated;

-- Visit request from a public page. The only way to create a lead: the
-- programme must be published, and a visitor may send at most 5 requests per
-- hour from one session and 20 per hour from one IP address.
create function public.submit_lead(
  p_project_id uuid,
  p_nom text,
  p_telephone text,
  p_session_id text,
  p_lot_id uuid default null,
  p_email text default null,
  p_message text default null,
  p_source text default 'page'
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

  insert into public.leads (project_id, lot_id, nom, telephone, email, message, source, session_id, ip_hash)
  values (
    p_project_id,
    p_lot_id,
    trim(p_nom),
    trim(p_telephone),
    nullif(lower(trim(p_email)), ''),
    nullif(trim(p_message), ''),
    coalesce(p_source, 'page'),
    p_session_id,
    v_ip_hash
  )
  returning id into v_lead_id;
  return v_lead_id;
end
$$;
revoke execute on function public.submit_lead(uuid, text, text, text, uuid, text, text, text) from public;
grant execute on function public.submit_lead(uuid, text, text, text, uuid, text, text, text) to anon, authenticated;
