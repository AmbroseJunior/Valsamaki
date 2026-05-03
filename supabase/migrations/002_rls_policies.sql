-- Valsamaki MVP — Row Level Security Policies

-- ─── PROFILES ────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Service role full access profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- ─── BUSINESSES ──────────────────────────────────────────────────────────────
alter table public.businesses enable row level security;

create policy "Anyone can view active businesses"
  on public.businesses for select
  using (is_active = true);

create policy "Producers manage own businesses"
  on public.businesses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Service role full access businesses"
  on public.businesses for all
  using (auth.role() = 'service_role');

-- ─── EVENTS ──────────────────────────────────────────────────────────────────
alter table public.events enable row level security;

create policy "Anyone can view active events"
  on public.events for select
  using (is_active = true);

create policy "Producers manage own events"
  on public.events for all
  using (auth.uid() = producer_id)
  with check (auth.uid() = producer_id);

create policy "Service role full access events"
  on public.events for all
  using (auth.role() = 'service_role');

-- ─── USER INTERACTIONS ───────────────────────────────────────────────────────
alter table public.user_interactions enable row level security;

create policy "Users insert own interactions"
  on public.user_interactions for insert
  with check (auth.uid() = user_id);

create policy "Users read own interactions"
  on public.user_interactions for select
  using (auth.uid() = user_id);

create policy "Service role full access interactions"
  on public.user_interactions for all
  using (auth.role() = 'service_role');

-- ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────
alter table public.recommendations enable row level security;

create policy "Users read own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Service role manages recommendations"
  on public.recommendations for all
  using (auth.role() = 'service_role');

-- ─── AI MEMORY ───────────────────────────────────────────────────────────────
alter table public.ai_memory enable row level security;

create policy "Users read own ai memory"
  on public.ai_memory for select
  using (auth.uid() = user_id);

create policy "Service role manages ai memory"
  on public.ai_memory for all
  using (auth.role() = 'service_role');

-- ─── KNOWLEDGE GRAPH ─────────────────────────────────────────────────────────
alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;

create policy "Anyone can read knowledge nodes"
  on public.knowledge_nodes for select
  using (true);

create policy "Anyone can read knowledge edges"
  on public.knowledge_edges for select
  using (true);

create policy "Service role manages knowledge"
  on public.knowledge_nodes for all
  using (auth.role() = 'service_role');

create policy "Service role manages knowledge edges"
  on public.knowledge_edges for all
  using (auth.role() = 'service_role');
