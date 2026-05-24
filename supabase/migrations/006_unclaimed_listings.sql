-- Valsamaki — Unclaimed listings support
-- Allows businesses and events to exist without an owner (OSM imports,
-- public markets, cultural sites, etc.). Adds provenance columns so
-- we can distinguish seeded rows from owner-created ones.

-- ── businesses ────────────────────────────────────────────────────────────────

-- Drop the old FK (CASCADE delete) and recreate as nullable + SET NULL
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;
ALTER TABLE public.businesses ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- source: where the row came from ('manual', 'osm', 'admin')
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

-- is_claimed: true once a real owner has verified/taken ownership
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false;

-- is_verified: true once the team has manually reviewed and approved the listing
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- osm_id: OpenStreetMap node ID — unique so re-runs don't duplicate rows
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS osm_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_osm_id
  ON public.businesses(osm_id) WHERE osm_id IS NOT NULL;

-- ── events ────────────────────────────────────────────────────────────────────

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_producer_id_fkey;
ALTER TABLE public.events ALTER COLUMN producer_id DROP NOT NULL;
ALTER TABLE public.events
  ADD CONSTRAINT events_producer_id_fkey
  FOREIGN KEY (producer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
