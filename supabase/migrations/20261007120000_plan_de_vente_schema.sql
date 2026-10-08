-- Plan de vente interactif — schema (step 1).
-- Every table has `id uuid` and `created_at`; prices and surfaces are numeric.
-- `project_id` is repeated on lot_shapes, media, leads and lot_events for fast
-- filtering; composite foreign keys make sure the lot belongs to that project.

create type public.member_role as enum ('owner', 'commercial');
create type public.project_status as enum ('draft', 'published');
create type public.lot_status as enum ('disponible', 'reservee', 'vendue');
create type public.media_kind as enum ('image', 'panorama', 'orbit_frame', 'orbit_mask', 'plan');
create type public.lead_status as enum ('nouveau', 'traite');
create type public.lot_event_type as enum ('vue_page', 'vue_lot', 'clic_lot', 'partage');

-- Polygon of a lot on the plan: [[x, y], …], at least 3 points, all within 0…1.
create function public.is_normalized_polygon(points jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(points) <> 'array' then false
    when jsonb_array_length(points) not between 3 and 1000 then false
    else not exists (
      select 1
      from jsonb_array_elements(points) as pt
      where case
        when jsonb_typeof(pt) <> 'array' then true
        when jsonb_array_length(pt) <> 2 then true
        when jsonb_typeof(pt -> 0) <> 'number' or jsonb_typeof(pt -> 1) <> 'number' then true
        else (pt ->> 0)::numeric not between 0 and 1 or (pt ->> 1)::numeric not between 0 and 1
      end
    )
  end
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  logo_path text,
  brand_color text check (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  brand_font text check (length(brand_font) <= 80)
);

create table public.members (
  id uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'commercial',
  primary key (organization_id, user_id)
);
create index members_user_id_idx on public.members (user_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  city text check (length(city) <= 120),
  description text,
  status public.project_status not null default 'draft',
  plan_image_path text,
  plan_width integer check (plan_width > 0),
  plan_height integer check (plan_height > 0),
  show_prices boolean not null default true,
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  custom_domain text unique check (custom_domain = lower(custom_domain))
);
create index projects_organization_id_idx on public.projects (organization_id);
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  numero text not null check (length(trim(numero)) between 1 and 40),
  type text check (length(type) <= 60),
  surface_habitable numeric(10, 2) check (surface_habitable >= 0),
  surface_terrain numeric(10, 2) check (surface_terrain >= 0),
  chambres smallint check (chambres >= 0),
  prix numeric(14, 2) check (prix >= 0),
  statut public.lot_status not null default 'disponible',
  description text,
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  sort_order integer not null default 0,
  unique (project_id, numero),
  -- target of the composite foreign keys below
  unique (id, project_id)
);
create index lots_project_sort_idx on public.lots (project_id, sort_order);
create trigger lots_set_updated_at before update on public.lots
  for each row execute function public.set_updated_at();

create table public.lot_shapes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lot_id uuid not null unique,
  project_id uuid not null,
  points jsonb not null check (public.is_normalized_polygon(points)),
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete cascade
);
create index lot_shapes_project_id_idx on public.lot_shapes (project_id);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  lot_id uuid,
  kind public.media_kind not null,
  path text not null,
  sort_order integer not null default 0,
  meta jsonb not null default '{}'::jsonb check (jsonb_typeof(meta) = 'object'),
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete cascade
);
create index media_project_sort_idx on public.media (project_id, sort_order);
create index media_lot_id_idx on public.media (lot_id);

-- Visit requests. Inserted only through public.submit_lead (rate limited).
-- A deleted lot keeps its leads and events (lot_id set to null).
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  lot_id uuid,
  nom text not null check (length(trim(nom)) between 1 and 120),
  telephone text not null check (length(trim(telephone)) between 6 and 30),
  email text check (length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  message text check (length(message) <= 2000),
  source text not null default 'page' check (source in ('page', 'embed', 'presentation')),
  status public.lead_status not null default 'nouveau',
  -- anonymous visitor session (sessionStorage) and hashed IP, for the rate limit
  session_id text check (length(session_id) <= 100),
  ip_hash text,
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete set null (lot_id)
);
create index leads_project_created_idx on public.leads (project_id, created_at desc);
create index leads_session_created_idx on public.leads (session_id, created_at);
create index leads_ip_created_idx on public.leads (ip_hash, created_at);
create index leads_lot_id_idx on public.leads (lot_id);

create table public.lot_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  lot_id uuid,
  type public.lot_event_type not null,
  session_id text check (length(session_id) <= 100),
  foreign key (lot_id, project_id) references public.lots (id, project_id) on delete set null (lot_id)
);
create index lot_events_project_created_idx on public.lot_events (project_id, created_at desc);
create index lot_events_lot_id_idx on public.lot_events (lot_id);
