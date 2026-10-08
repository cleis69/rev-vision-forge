-- Plan de vente — step 7: live lot status on the public pages.
-- Visitors cannot read the lots table (prices), so they cannot use
-- postgres_changes. Instead, every change of a lot sends a signal on the
-- private Realtime channel "programme:<project_id>"; the page then reads the
-- lots again through public_lots, which keeps hidden prices hidden.
-- Private channel: visitors may only listen to published programmes (members
-- also to their drafts), and nobody can send on it from a browser.

create function private.can_listen(topic text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where 'programme:' || p.id::text = topic
      and (p.status = 'published' or private.is_member(p.organization_id))
  )
$$;
revoke execute on function private.can_listen(text) from public;
grant execute on function private.can_listen(text) to anon, authenticated;

create function private.notify_lot_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lot public.lots := coalesce(new, old);
begin
  -- Only the id and the status: the price never goes through the channel.
  perform realtime.send(
    jsonb_build_object(
      'lot_id', lot.id,
      'numero', lot.numero,
      'op', tg_op,
      'statut', case when tg_op = 'DELETE' then null else new.statut end,
      'avant', case when tg_op = 'UPDATE' then old.statut end
    ),
    'lot',
    'programme:' || lot.project_id::text,
    true
  );
  return null;
end
$$;
revoke execute on function private.notify_lot_change() from public, anon, authenticated;

create trigger lots_notify_change
  after insert or update or delete on public.lots
  for each row execute function private.notify_lot_change();

create policy "realtime: listen to published programmes" on realtime.messages
  for select to anon, authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and (select private.can_listen((select realtime.topic())))
  );
