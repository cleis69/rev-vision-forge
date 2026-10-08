-- Plan de vente interactif — visit requests kept three years at most after the
-- last exchange with the sales team, as the page « Données personnelles »
-- promises. The last exchange of a request: its date, or the last time the
-- team changed it (updated_at); a person who asked again for the same
-- organization (same phone or e-mail) keeps all their requests until three
-- years after the latest one. A job runs the purge every night (pg_cron).

alter table public.leads add column updated_at timestamptz;
update public.leads set updated_at = created_at;
alter table public.leads alter column updated_at set not null;
alter table public.leads alter column updated_at set default now();

create function private.touch_lead()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;
revoke execute on function private.touch_lead() from public, anon, authenticated;

-- Only an action of the team counts as an exchange, not the notification e-mail.
create trigger leads_touch
  before update of status on public.leads
  for each row execute function private.touch_lead();

create function private.purge_old_leads()
returns integer
language sql
security definer
set search_path = ''
as $$
  with expired as (
    delete from public.leads l
    where greatest(l.created_at, l.updated_at) < now() - interval '3 years'
      and not exists (
        select 1
        from public.leads r
        join public.projects pr on pr.id = r.project_id
        join public.projects pl on pl.id = l.project_id
        where pr.organization_id = pl.organization_id
          and (r.telephone = l.telephone or (l.email is not null and r.email = l.email))
          and greatest(r.created_at, r.updated_at) >= now() - interval '3 years'
      )
    returning 1
  )
  select count(*)::integer from expired
$$;
revoke execute on function private.purge_old_leads() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('rev-purge-demandes', '17 3 * * *', 'select private.purge_old_leads()');
