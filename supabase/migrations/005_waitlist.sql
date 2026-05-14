-- Waitlist: collect early-access emails before full public launch
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  locale     text,
  source     text not null default 'language_picker',
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique  unique (email),
  constraint waitlist_email_format  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Enable RLS — no anon/user SELECT; all reads go through service-role API only
alter table public.waitlist enable row level security;

create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);
