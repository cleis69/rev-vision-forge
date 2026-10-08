-- Plan de vente — step 8: visit requests reach the promoter.
-- 1. Promoter space, live: leads joins the Realtime publication; the RLS of
--    leads applies, so members only receive the requests of their programmes.
-- 2. E-mail: a trigger calls the Edge Function notify-lead with the id of the
--    new request (pg_net, asynchronous: the request is saved even when the
--    call fails). The function only handles recent requests that were not
--    notified yet, so calling it from elsewhere cannot make it send anything
--    else. Without an e-mail service configured, it sends nothing.

create extension if not exists pg_net;

-- TRUNCATE ignores row level security: nobody outside migrations needs it.
revoke truncate on all tables in schema public from anon, authenticated;

-- Set by notify-lead once the e-mail is sent; members cannot change it.
alter table public.leads add column notified_at timestamptz;

alter publication supabase_realtime add table public.leads;

create function private.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform net.http_post(
      url := 'https://hbihlcnhmjommcnpujam.supabase.co/functions/v1/notify-lead',
      body := jsonb_build_object('lead_id', new.id),
      headers := jsonb_build_object('Content-Type', 'application/json'),
      timeout_milliseconds := 5000
    );
  exception when others then
    -- Never lose a visit request because of the notification.
    raise warning 'notify-lead: %', sqlerrm;
  end;
  return null;
end
$$;
revoke execute on function private.notify_new_lead() from public, anon, authenticated;

create trigger leads_notify_new
  after insert on public.leads
  for each row execute function private.notify_new_lead();
