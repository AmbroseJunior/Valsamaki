// Runs the itineraries migration via Supabase REST
// Usage: node scripts/run-migration.js
const https = require('https')

const SUPABASE_URL = 'https://fnevubaewpmbsbokonaj.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZXZ1YmFld3BtYnNib2tvbmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzczNDY3MSwiZXhwIjoyMDkzMzEwNjcxfQ.ObD3l9wnDWjGB4Bksl7DI65yVF_6KGYByHVI-rifWag'

const SQL = `
create extension if not exists "uuid-ossp";

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

alter table public.itineraries enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'itineraries' and policyname = 'Users can insert own itineraries'
  ) then
    create policy "Users can insert own itineraries"
      on public.itineraries for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'itineraries' and policyname = 'Users can select own itineraries'
  ) then
    create policy "Users can select own itineraries"
      on public.itineraries for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'itineraries' and policyname = 'Users can delete own itineraries'
  ) then
    create policy "Users can delete own itineraries"
      on public.itineraries for delete
      using (auth.uid() = user_id);
  end if;
end $$;
`

const body = JSON.stringify({ query: SQL })
const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec`)

// Supabase doesn't expose a raw SQL RPC by default, so we use the pg endpoint
// via the Management API approach — this actually sends via supabase-js style
const postData = JSON.stringify({ query: SQL })

const options = {
  hostname: 'fnevubaewpmbsbokonaj.supabase.co',
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Length': Buffer.byteLength(postData),
  },
}

console.log('Attempting migration via REST API...')

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => data += chunk)
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
      console.log('✓ Migration applied successfully')
    } else {
      console.log(`Status: ${res.statusCode}`)
      console.log('Response:', data)
      console.log('\n⚠️  The exec RPC is not available (expected without CLI setup).')
      console.log('\nTo apply the migration manually, go to your Supabase SQL Editor:')
      console.log('https://supabase.com/dashboard/project/fnevubaewpmbsbokonaj/sql/new')
      console.log('\nPaste and run the SQL from: supabase/migrations/004_itineraries.sql')
    }
  })
})

req.on('error', (e) => {
  console.error('Request error:', e.message)
  console.log('\nTo apply the migration manually:')
  console.log('https://supabase.com/dashboard/project/fnevubaewpmbsbokonaj/sql/new')
})

req.write(postData)
req.end()
