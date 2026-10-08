-- Plan de vente interactif — statistics of a programme (step 10).
-- One call returns the figures of the Statistiques tab: the last p_days
-- calendar days in the user's time zone (today included), the period of the
-- same length just before (for the trends), one row per day and one per lot.
-- Security invoker: RLS still decides what is read, and anyone who is not a
-- member of the programme's organization is refused outright.

create function public.project_stats(p_project_id uuid, p_days integer, p_tz text default 'UTC')
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_tz text := p_tz;
  v_now timestamptz := now();
  v_today date;
  v_first date;
  v_from timestamptz;
  v_prev timestamptz;
  v_result jsonb;
begin
  if not (select private.can_edit_project(p_project_id)) then
    raise exception 'Not a member of the organization of this programme' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 366 then
    raise exception 'p_days must be between 1 and 366' using errcode = '22023';
  end if;
  if v_tz is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;

  v_today := (v_now at time zone v_tz)::date;
  v_first := v_today - (p_days - 1);
  v_from := v_first::timestamp at time zone v_tz;
  -- Same length as the current period, which ends now (today is not over).
  v_prev := v_from - (v_now - v_from);

  with ev as (
    select e.type, e.session_id, e.lot_id, (e.created_at at time zone v_tz)::date as day,
           e.created_at >= v_from as cur
    from public.lot_events e
    where e.project_id = p_project_id and e.created_at >= v_prev and e.created_at <= v_now
  ),
  ld as (
    select l.lot_id, l.source, (l.created_at at time zone v_tz)::date as day,
           l.created_at >= v_from as cur
    from public.leads l
    where l.project_id = p_project_id and l.created_at >= v_prev and l.created_at <= v_now
  ),
  totals as (
    select
      jsonb_build_object(
        'visites', count(distinct ev.session_id) filter (where ev.cur),
        'vues_page', count(*) filter (where ev.cur and ev.type = 'vue_page'),
        'vues_lot', count(*) filter (where ev.cur and ev.type = 'vue_lot'),
        'clics_lot', count(*) filter (where ev.cur and ev.type = 'clic_lot'),
        'partages', count(*) filter (where ev.cur and ev.type = 'partage'),
        'demandes', (select count(*) from ld where ld.cur)
      ) as current,
      jsonb_build_object(
        'visites', count(distinct ev.session_id) filter (where not ev.cur),
        'vues_page', count(*) filter (where not ev.cur and ev.type = 'vue_page'),
        'vues_lot', count(*) filter (where not ev.cur and ev.type = 'vue_lot'),
        'clics_lot', count(*) filter (where not ev.cur and ev.type = 'clic_lot'),
        'partages', count(*) filter (where not ev.cur and ev.type = 'partage'),
        'demandes', (select count(*) from ld where not ld.cur)
      ) as previous
    from ev
  ),
  days as (
    select d::date as day
    from generate_series(v_first::timestamp, v_today::timestamp, interval '1 day') as d
  ),
  daily as (
    select jsonb_agg(
      jsonb_build_object(
        'day', days.day,
        'visites', coalesce(e.visites, 0),
        'vues_lot', coalesce(e.vues_lot, 0),
        'demandes', coalesce(l.demandes, 0)
      ) order by days.day
    ) as rows
    from days
    left join (
      select ev.day, count(distinct ev.session_id) as visites,
             count(*) filter (where ev.type = 'vue_lot') as vues_lot
      from ev where ev.cur group by ev.day
    ) e on e.day = days.day
    left join (
      select ld.day, count(*) as demandes from ld where ld.cur group by ld.day
    ) l on l.day = days.day
  ),
  per_lot as (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'lot_id', coalesce(e.lot_id, l.lot_id),
        'vues', coalesce(e.vues, 0),
        'clics', coalesce(e.clics, 0),
        'partages', coalesce(e.partages, 0),
        'demandes', coalesce(l.demandes, 0)
      )
    ), '[]'::jsonb) as rows
    from (
      select ev.lot_id,
             count(*) filter (where ev.type = 'vue_lot') as vues,
             count(*) filter (where ev.type = 'clic_lot') as clics,
             count(*) filter (where ev.type = 'partage') as partages
      from ev where ev.cur and ev.lot_id is not null group by ev.lot_id
    ) e
    full join (
      select ld.lot_id, count(*) as demandes
      from ld where ld.cur and ld.lot_id is not null group by ld.lot_id
    ) l on l.lot_id = e.lot_id
  ),
  sources as (
    select coalesce(jsonb_object_agg(s.source, s.n), '{}'::jsonb) as counts
    from (select ld.source, count(*) as n from ld where ld.cur group by ld.source) s
  )
  select jsonb_build_object(
    'days', p_days,
    'tz', v_tz,
    'from', v_from,
    'to', v_now,
    'previous_from', v_prev,
    'totals', totals.current,
    'previous', totals.previous,
    'daily', daily.rows,
    'lots', per_lot.rows,
    'sources', sources.counts
  )
  into v_result
  from totals, daily, per_lot, sources;

  return v_result;
end;
$$;

revoke execute on function public.project_stats(uuid, integer, text) from public, anon;
grant execute on function public.project_stats(uuid, integer, text) to authenticated;
