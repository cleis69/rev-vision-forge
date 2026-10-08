-- Plan de vente interactif — pg_net out of the public schema (Supabase advisor
-- "extension in public"). pg_net cannot change schema: it is dropped and
-- created again in the extensions schema. Its functions and tables stay in
-- the net schema, where the trigger of the visit requests (notify_new_lead)
-- calls net.http_post; only pending calls would be lost, and none are left.

drop extension if exists pg_net;
create extension pg_net with schema extensions;
