-- Valsamaki — User Itineraries Table
-- Run: supabase db push

create table if not exists public.itineraries (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  tagline      text,
  days_count   int not null default 1,
  interests    text[] not null default '{}',
  diet         text not null default 'none',
  style        text not null default 'balanced',
  data         jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_itineraries_user_id on public.itineraries(user_id);
create index if not exists idx_itineraries_created_at on public.itineraries(created_at desc);

-- RLS: users can only see their own itineraries
alter table public.itineraries enable row level security;

create policy "Users can insert own itineraries"
  on public.itineraries for insert
  with check (auth.uid() = user_id);

create policy "Users can select own itineraries"
  on public.itineraries for select
  using (auth.uid() = user_id);

create policy "Users can delete own itineraries"
  on public.itineraries for delete
  using (auth.uid() = user_id);
