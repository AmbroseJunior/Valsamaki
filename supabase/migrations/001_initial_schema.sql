-- Valsamaki MVP — Initial Schema
-- Run: supabase db push

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'user' check (role in ('guest','user','producer','admin')),
  name         text,
  language     text not null default 'en',
  preferences  jsonb,
  location_lat double precision,
  location_lng double precision,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── BUSINESSES ──────────────────────────────────────────────────────────────
create table if not exists public.businesses (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  category    text not null,
  lat         double precision,
  lng         double precision,
  address     text,
  phone       text,
  website     text,
  images      text[] not null default '{}',
  tags        text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_businesses_owner on public.businesses(owner_id);
create index if not exists idx_businesses_category on public.businesses(category);
create index if not exists idx_businesses_location on public.businesses(lat, lng) where is_active = true;
create index if not exists idx_businesses_active on public.businesses(is_active);
create index if not exists idx_businesses_name_trgm on public.businesses using gin (name gin_trgm_ops);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id             uuid primary key default uuid_generate_v4(),
  producer_id    uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text,
  event_date     timestamptz not null,
  lat            double precision,
  lng            double precision,
  address        text,
  category       text not null,
  max_attendees  integer,
  price          numeric not null default 0,
  images         text[] not null default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_events_producer on public.events(producer_id);
create index if not exists idx_events_date on public.events(event_date) where is_active = true;
create index if not exists idx_events_location on public.events(lat, lng) where is_active = true;

-- ─── USER INTERACTIONS ───────────────────────────────────────────────────────
create table if not exists public.user_interactions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  entity_type      text not null check (entity_type in ('business','event')),
  entity_id        uuid not null,
  action           text not null check (action in ('view','save','click','rsvp','share')),
  session_location jsonb,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists idx_interactions_user on public.user_interactions(user_id, created_at desc);
create index if not exists idx_interactions_entity on public.user_interactions(entity_id);

-- ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────
create table if not exists public.recommendations (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  entity_type  text not null,
  entity_id    uuid not null,
  score        numeric not null check (score between 0 and 1),
  reason       text,
  source       text not null default 'deepseek',
  generated_at timestamptz not null default now(),
  expires_at   timestamptz not null
);

create index if not exists idx_recommendations_user on public.recommendations(user_id, expires_at desc);

-- ─── AI MEMORY ───────────────────────────────────────────────────────────────
create table if not exists public.ai_memory (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  session_id text not null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_memory_user on public.ai_memory(user_id, created_at desc);

-- ─── KNOWLEDGE GRAPH ─────────────────────────────────────────────────────────
create table if not exists public.knowledge_nodes (
  id               uuid primary key default uuid_generate_v4(),
  label            text not null unique,
  category         text not null check (category in ('food','activity','health_outcome','recipe','tradition')),
  description      text not null,
  source_citations text[] not null default '{}',
  created_at       timestamptz not null default now()
);

create index if not exists idx_knowledge_nodes_category on public.knowledge_nodes(category);
create index if not exists idx_knowledge_nodes_desc_trgm on public.knowledge_nodes using gin (description gin_trgm_ops);

create table if not exists public.knowledge_edges (
  from_node    text not null references public.knowledge_nodes(label) on delete cascade,
  to_node      text not null references public.knowledge_nodes(label) on delete cascade,
  relationship text not null,
  weight       numeric not null check (weight between 0 and 1),
  created_at   timestamptz not null default now(),
  primary key (from_node, to_node, relationship)
);

create index if not exists idx_knowledge_edges_from on public.knowledge_edges(from_node, weight desc);
create index if not exists idx_knowledge_edges_to on public.knowledge_edges(to_node);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at_businesses before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger set_updated_at_events before update on public.events
  for each row execute function public.set_updated_at();
