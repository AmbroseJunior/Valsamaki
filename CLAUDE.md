# Valsamaki — Complete Process Documentation

> This document is the single source of truth for how the entire Valsamaki platform
> works. Every flow, every file, every decision is explained here. Read this before
> touching any code.

---

## 1. What Valsamaki Is

Valsamaki is a digital platform that connects people with authentic Cretan producers,
local experiences, the Mediterranean diet, and Cretan food science. Built as a PWA
(Progressive Web App) so it works on any device.

**Current state: Pre-launch / under construction.**
The public sees only a waitlist. The admin (owner) has full access to build and test
the app behind the gate.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Server components, file-based routing, middleware |
| Language | TypeScript (strict) | Type safety across the entire stack |
| Styling | Tailwind CSS + CSS variables | Design tokens, dark mode ready |
| Database | Supabase (Postgres) | Auth, RLS, realtime, geospatial |
| Auth | Supabase Auth | Email/password + Google + Apple OAuth |
| AI | Claude (Anthropic) + DeepSeek | Multi-provider with automatic fallback |
| i18n | next-intl | 11 languages, server + client components |
| State | Zustand | Client-side global state |
| Data fetching | TanStack Query | Caching, background refetch |
| Maps | Leaflet + react-leaflet | Interactive Crete map |
| Animations | Framer Motion | Page transitions, UI polish |
| Deployment | Vercel | Auto-deploy on push to main |
| Package manager | pnpm | Faster installs, strict dependency resolution |

---

## 3. Repository Structure — Every File Explained

```
d:\Valsamaki\
│
├── CLAUDE.md                   ← THIS FILE — read before coding
├── middleware.ts               ← The access gate — controls who sees what
├── next.config.mjs             ← Next.js config (PWA, i18n, image domains)
├── tailwind.config.ts          ← Design tokens + Tailwind customisation
├── tsconfig.json               ← TypeScript config (strict mode, path aliases)
├── package.json                ← Dependencies + scripts
├── vercel.json                 ← Vercel deployment config
│
├── app/                        ← Next.js App Router pages
│   │
│   ├── layout.tsx              ← Root layout: fonts, NextIntlClientProvider, Providers
│   ├── globals.css             ← Global styles, CSS reset
│   ├── providers.tsx           ← TanStack Query provider, theme provider
│   │
│   ├── coming-soon/            ← THE PUBLIC LANDING PAGE (waitlist)
│   │   └── page.tsx            ← Step 1: language picker → Step 2: email form
│   │
│   ├── thank-you/              ← Post-waitlist confirmation
│   │   └── page.tsx            ← Shows position number + founding member badge
│   │
│   ├── (auth)/                 ← Auth route group (no shared layout)
│   │   ├── login/page.tsx      ← Login + register form (Google, Apple, email)
│   │   └── register/page.tsx   ← Redirects to /login?tab=register
│   │
│   ├── (guest)/                ← Public-facing pages (blocked pre-launch)
│   │   └── page.tsx            ← Home / hero page
│   │
│   ├── (user)/                 ← Authenticated user pages
│   │   ├── dashboard/page.tsx  ← Main hub: weather, map, trending, AI suggestions
│   │   ├── chatbot/page.tsx    ← AI assistant (server wrapper → Chatbot component)
│   │   ├── explore/page.tsx    ← Browse experiences, filter by category/price
│   │   ├── map/page.tsx        ← Interactive Crete map with layers
│   │   ├── events/page.tsx     ← Event feed with date/category filters
│   │   ├── plan/page.tsx       ← AI-powered itinerary builder
│   │   ├── products/page.tsx   ← Local product directory with QR scan
│   │   └── settings/page.tsx   ← Language, notifications, account preferences
│   │
│   ├── (producer)/             ← Producer-only pages
│   │   ├── business/page.tsx   ← Producer profile + listing management
│   │   └── analytics/page.tsx  ← Views, clicks, waitlist interest metrics
│   │
│   ├── onboarding/page.tsx     ← First-time user setup (preferences, location)
│   │
│   └── api/                    ← All API routes (never blocked by maintenance gate)
│       ├── ai/
│       │   ├── chat/route.ts           ← Main chatbot endpoint
│       │   ├── voice-setup/route.ts    ← Voice → business listing extraction
│       │   ├── itinerary/route.ts      ← AI trip planner
│       │   └── experience-suggestions/route.ts ← Personalised recommendations
│       ├── waitlist/
│       │   ├── route.ts                ← POST: submit email to waitlist
│       │   └── count/route.ts          ← GET: public waitlist count
│       ├── locale/route.ts             ← POST: set locale cookie
│       ├── auth/callback/route.ts      ← Supabase OAuth callback
│       ├── location/update/route.ts    ← Store user GPS position
│       ├── voice/transcribe/route.ts   ← Speech-to-text
│       ├── weather/route.ts            ← Crete weather data
│       ├── routing/route.ts            ← Map route computation
│       ├── farmers-markets/route.ts    ← Farmers market locations + hours
│       ├── news/route.ts               ← Cretan news feed
│       ├── product-scan/route.ts       ← QR code product lookup
│       ├── user/
│       │   ├── save-itinerary/route.ts ← Persist trip plan
│       │   └── delete/route.ts         ← Account deletion (GDPR)
│       └── cron/sync-data/route.ts     ← Background data sync (Vercel cron)
│
├── components/
│   ├── ai/
│   │   ├── Chatbot.tsx         ← Full chat UI: messages, input, suggestions, scroll
│   │   ├── FloatingChatbot.tsx ← Floating button + drawer wrapper
│   │   ├── VoiceInput.tsx      ← Mic recording → transcription → chat
│   │   └── AICard.tsx          ← Suggestion card with title, description, CTA
│   ├── shared/
│   │   ├── Navbar.tsx          ← Top nav: logo, search, locale switcher, auth
│   │   ├── BottomNav.tsx       ← Mobile bottom tab bar
│   │   ├── OfflineBanner.tsx   ← Shows when device loses connection
│   │   ├── WeatherBox.tsx      ← Current weather widget
│   │   ├── LoadingSpinner.tsx  ← Reusable spinner (size prop: sm/md/lg)
│   │   ├── RoleGate.tsx        ← Client-side role check wrapper
│   │   └── LocaleSwitcher.tsx  ← Language dropdown
│   ├── ui/                     ← Headless primitives (shadcn-style)
│   │   ├── button.tsx, card.tsx, input.tsx, dialog.tsx, toast.tsx, etc.
│   ├── map/
│   │   ├── MapView.tsx         ← Main Leaflet map component
│   │   └── LocationPin.tsx     ← Custom map marker
│   ├── dashboard/              ← Dashboard-specific widgets
│   ├── explore/                ← Experience cards and detail modals
│   ├── events/                 ← Event list items and filter bar
│   └── producers/              ← Producer card components
│
├── lib/
│   ├── ai/
│   │   ├── rag.ts              ← RAG engine ← MOST IMPORTANT AI FILE
│   │   ├── cretan-knowledge.ts ← Legacy: full knowledge dump (not used in chat)
│   │   ├── mcp-bridge.ts       ← AI orchestrator: routes tasks to providers
│   │   ├── local-context.ts    ← Builds per-request context for the AI
│   │   ├── knowledge-graph.ts  ← Graph traversal for food topic relations
│   │   ├── recommendation.ts   ← Generates personalised place/experience recommendations
│   │   ├── data-context.ts     ← Formats experiences/markets/sights for AI context
│   │   └── providers/
│   │       ├── index.ts        ← Provider registry (getPrimaryProvider, getAvailableProviders)
│   │       ├── claude.ts       ← Anthropic Claude provider (uses RAG)
│   │       ├── deepseek.ts     ← DeepSeek provider (uses RAG, OpenAI-compatible)
│   │       └── gemini.ts       ← Google Gemini provider (optional)
│   ├── supabase/
│   │   ├── server.ts           ← createClient() (anon) + createServiceClient() (service role)
│   │   ├── client.ts           ← Browser Supabase client (for client components)
│   │   └── middleware.ts       ← updateSession() — extracts user + role for middleware.ts
│   ├── data/
│   │   ├── experiences.ts      ← Static list of Cretan experiences
│   │   ├── scrapedExperiences.ts ← Scraped third-party experiences
│   │   └── scrapedPlaces.ts    ← Scraped tourist sights
│   ├── i18n/
│   │   └── locales.ts          ← SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS
│   ├── offline/
│   │   └── queue.ts            ← Queues failed requests for retry when back online
│   ├── logger.ts               ← Structured logging (wraps console with levels)
│   ├── security.ts             ← rateLimit(), validateString() — OWASP helpers
│   └── utils.ts                ← cn() class merger, date helpers, misc utilities
│
├── hooks/
│   ├── useLocation.ts          ← Browser geolocation with permission handling
│   ├── useOffline.ts           ← Detects online/offline state
│   ├── useRecommendations.ts   ← Fetches + caches AI recommendations
│   └── useRealtime.ts          ← Supabase realtime subscription wrapper
│
├── data/                       ← Scientific knowledge base (CSV — 228 KB total)
│   ├── foods.csv               ← Every Cretan food: id, name, description, category
│   ├── compounds.csv           ← Bioactive compounds per food (oleuropein, etc.)
│   ├── health_goals.csv        ← Health benefit categories (cardiovascular, longevity…)
│   ├── food_health_goals.csv   ← Which food helps which goal + evidence strength (1/2/3)
│   ├── nutrition.csv           ← Nutritional highlights per food
│   ├── studies.csv             ← Peer-reviewed studies: title, DOI, type, finding
│   ├── food_details.csv        ← Flavour profile, preparation method, historical use
│   └── ui_copy.csv             ← UI string archive (reference only, not used in RAG)
│
├── messages/                   ← i18n translation files (11 locales)
│   ├── en.json                 ← SOURCE OF TRUTH — always edit this first
│   ├── el.json                 ← Greek
│   ├── de.json                 ← German
│   ├── fr.json                 ← French
│   ├── it.json                 ← Italian
│   ├── es.json                 ← Spanish
│   ├── nl.json                 ← Dutch
│   ├── pt.json                 ← Portuguese
│   ├── ru.json                 ← Russian
│   ├── zh.json                 ← Chinese (Simplified)
│   └── ar.json                 ← Arabic
│
├── scripts/
│   ├── translate.mjs           ← Auto-translate missing keys using Claude API
│   └── add-locale-translations.js ← Legacy manual bulk translation helper
│
├── supabase/
│   ├── config.toml             ← Local Supabase config
│   ├── migrations/             ← SQL migrations (applied in order)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_knowledge_graph_seed.sql
│   │   ├── 005_waitlist.sql
│   │   └── 006_waitlist_rls_and_count.sql
│   └── functions/              ← Supabase Edge Functions
│       ├── ai-chat/index.ts
│       └── location-update/index.ts
│
├── types/
│   ├── database.ts             ← Generated Supabase types (DO NOT hand-edit)
│   ├── ai.ts                   ← MCPRequest, MCPResponse, AIContext, AIMessage
│   ├── roles.ts                ← Role type: 'guest' | 'user' | 'producer' | 'admin'
│   ├── experience.ts           ← Experience, Activity, Place types
│   └── app.ts                  ← App-wide shared types
│
└── public/
    ├── v1.png                  ← Valsamaki logo (used everywhere — never rename)
    ├── manifest.json           ← PWA manifest (name, icons, theme colour)
    └── offline.html            ← Shown when user is offline + not cached
```

---

## 4. Access Control — The Gate System

This is the most critical system. Every request goes through `middleware.ts` before
any page renders.

### How the middleware works (step by step)

```
Every request
      ↓
1. updateSession(request)
   → reads Supabase session cookie
   → fetches user.id from auth
   → fetches role from profiles table
   → returns { response, user, role }
      ↓
2. Apply OWASP security headers to every response
      ↓
3. API routes (/api/*)  →  return immediately
   (API routes handle their own auth — never redirected)
      ↓
4. Is this a BYPASS route?
   Bypass list: /coming-soon, /thank-you, /login, /auth
      ↓ YES
   Is it a login/register route AND user is already logged in?
      → admin:     redirect to /dashboard
      → non-admin: redirect to /coming-soon
   Otherwise: let through without any further checks
      ↓ NO
5. Is role === 'admin'?
      → NO:  redirect to /coming-soon  (the gate — no exceptions)
      → YES: continue
      ↓
6. Is user logged in?
      → NO:  redirect to /login?next={pathname}
      → YES: continue
      ↓
7. Serve the requested page
```

### Why bypass routes skip all auth checks

`/coming-soon` and `/thank-you` must be reachable by ANYONE — logged in or not,
admin or not. Before the fix, they fell through to the auth wall (`!isPublicRoute && !user`)
and got redirected to `/login?next=/coming-soon`. The bypass block now returns immediately,
skipping all subsequent checks.

### Role hierarchy

```
guest    → no account, not logged in
user     → registered account (post-launch)
producer → business owner (post-launch)
admin    → you (nadis2u@gmail.com) — full access always
```

Roles are stored in the `profiles` table (`role` column). The Supabase middleware reads
this on every request — it cannot be spoofed client-side.

---

## 5. The Public User Flow (Pre-Launch)

This is the ONLY journey a non-admin visitor can take:

```
valsamaki.eu  (any URL)
      ↓
middleware.ts
  → user is not admin
  → redirect to /coming-soon
      ↓
/coming-soon — Step 1: Language Picker
  Full-screen dark page
  11 language flags displayed in a grid
  User taps a flag
      ↓
  POST /api/locale  { locale: 'el' }
    → sets NEXT_LOCALE cookie (read by next-intl on every server render)
    → sets sessionStorage key 'valsamaki_lang_chosen'
    → component moves to step 2
      ↓
/coming-soon — Step 2: Waitlist Form
  Page now rendered in the chosen language (via useTranslations)
  User sees: headline, description, social proof counter, email input, 3 perk cards
  🔑 icon in footer (invisible to regular users) → /login
      ↓
  User types email → clicks "Notify me at launch"
      ↓
  POST /api/waitlist  { email, locale, source: 'coming_soon' }
    → rate limit: 3 requests / 60s per IP
    → validates email format
    → inserts into Supabase waitlist table (RLS: anon INSERT allowed)
    → calls get_waitlist_count() RPC to get their position
    → returns { ok: true, position: 42 }
      ↓
  router.push('/thank-you?p=42')
      ↓
/thank-you?p=42
  Founding Member badge
  Position: #42 on the waitlist
  All text in the user's chosen language
  No navigation, no links back into the app
  Dead end — perfect
```

### Returning visitor behaviour

If the user has `sessionStorage('valsamaki_lang_chosen')` set (meaning they already
picked a language this browser session), `/coming-soon` skips step 1 and shows the
waitlist form immediately — in whatever language was set in the cookie.

---

## 6. The Admin Flow

```
valsamaki.eu
      ↓
/coming-soon  (admin sees the same waitlist page as everyone else)
      ↓
Scroll to the very bottom of the page
Tap the tiny 🔑 in the footer
      ↓
/login
  Enter: nadis2u@gmail.com + password
  (or continue with Google — whichever the admin account uses)
      ↓
Supabase auth.signInWithPassword()
  → session created
  → middleware reads role = 'admin' from profiles table
      ↓
Redirected to /dashboard  ← full app, no restrictions
```

### How admin role is set

The `role` field in Supabase's `profiles` table must be `'admin'` for that user.

To grant admin access to a user (run in Supabase SQL editor):
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';
-- Or by email (join with auth.users):
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'nadis2u@gmail.com');
```

---

## 7. Waitlist System — Complete Detail

### Database table

```sql
CREATE TABLE public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL
               CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale     TEXT,           -- language code the user submitted in (el, en, de…)
  source     TEXT NOT NULL DEFAULT 'coming_soon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anyone (including anonymous) can insert — needed for public waitlist
CREATE POLICY "waitlist_anon_insert"
  ON public.waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Nobody can read emails except service role (privacy)
-- (no SELECT policy = only service role can query)
```

### Count function (public, no data exposure)

```sql
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS BIGINT LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*) FROM public.waitlist;
$$;
GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;
```

This lets the waitlist page show "Join 47 others" without exposing any emails.

### API endpoints

**POST `/api/waitlist`** — Submit an email
```
Input:  { email: string, locale?: string, source?: string }
Output: { ok: true, position: number }
        { already: true, position: number }  ← duplicate email
        { error: 'Invalid email' }            ← 400
        { error: 'Too many requests' }        ← 429 (3 req/60s per IP)
```

**GET `/api/waitlist/count`** — Public count
```
Output: { count: number }
```

---

## 8. AI / RAG System — Complete Detail

### The problem RAG solves

The knowledge base (`/data/` CSV files) is 228 KB of Cretan food science. Injecting
all of it into every LLM prompt is expensive and imprecise. RAG (Retrieval-Augmented
Generation) retrieves only the sections relevant to the user's specific question.

### Full AI request flow

```
User types: "What are the heart benefits of olive oil?"
      ↓
POST /api/ai/chat
  { message, userId, locale }
  → Auth check: must be logged in (401 if not)
  → Rate limit: 20 req/min per user
  → Input validation: 1–2000 chars
      ↓
mcpBridge({ task: 'chat', userId, input: message })
      ↓
buildLocalContext(userId, location, message)
  Runs in parallel:
  ├── supabase: profiles → user preferences
  ├── supabase: user_interactions → last 20 actions
  ├── supabase: ai_memory → last 20 conversation messages
  └── if location: supabase geospatial → nearby businesses + events (10km radius)
  + traverseKnowledgeGraph(message) → related food topic nodes
      ↓
getPrimaryProvider()  →  Claude or DeepSeek (whichever has API key)
      ↓
provider.chat(messages, context)
      ↓
buildSystemMessage(context, userQuery)
  1. System preamble: "You are Valsamaki, an AI guide to authentic Crete…"
  2. retrieveRelevantKnowledge("heart benefits olive oil", 8)
     ← RAG: scores all foods, returns olive oil section + related foods
  3. Nearby businesses JSON (if any)
  4. Upcoming events JSON (if any)
  5. User preferences JSON
  6. Language instruction: "Respond ONLY in Greek"
      ↓
LLM API call → response text
      ↓
saveMemory(userId, userMessage, assistantResponse)
  → inserts into ai_memory table (for conversation history)
      ↓
return { output: "Olive oil contains oleuropein, a polyphenol…", provider: "claude" }
```

### RAG scoring algorithm (`lib/ai/rag.ts`)

```
Query: "heart benefits olive oil"
Keywords extracted (stop-words removed): ["heart", "benefits", "olive", "oil"]

For each food in foods.csv:
  score = 0
  + 10 if food name contains any keyword      → "Olive Oil" scores +10 (olive, oil)
  + 3  if food description contains keyword   → description mentions "heart" → +3
  + 2  if food category contains keyword
  + 5  for each matching health goal name      → "cardiovascular" matches "heart" → +5
  + 4  for each matching bioactive compound
  + 3  for each matching nutritional nutrient

Foods sorted by score descending → top 8 returned

For "heart benefits olive oil":
  Olive Oil         score: 28  ← returned
  Olives            score: 12  ← returned
  Thyme Honey       score: 6   ← returned (has cardiovascular goal)
  … up to 8 foods
```

### Adding new knowledge (zero code changes needed)

To add a new food:
1. Add a row to `data/foods.csv`
2. Add its compounds to `data/compounds.csv`
3. Add its health effects to `data/food_health_goals.csv`
4. Add studies to `data/studies.csv`
5. Deploy → RAG picks it up automatically (cache resets on server start)

### AI providers

```
Primary:  Claude (claude-haiku-4-5) — set ANTHROPIC_API_KEY in Vercel
Fallback: DeepSeek (deepseek-chat)  — set DEEPSEEK_API_KEY in Vercel

If Claude fails → automatically tries DeepSeek
If both fail    → returns a graceful "I'm temporarily unavailable" message
```

### Conversation memory

Every chat message pair is saved to the `ai_memory` table:
```sql
ai_memory: user_id, session_id, role ('user'|'assistant'), content, created_at
```
The last 20 messages are loaded back on each request so the AI remembers context
within a conversation session.

---

## 9. i18n / Translation System — Complete Detail

### Supported languages

```
en → English (source of truth)
el → Greek
de → German
fr → French
it → Italian
es → Spanish
nl → Dutch
pt → Portuguese
ru → Russian
zh → Chinese (Simplified)
ar → Arabic
```

### How translations work at runtime

1. User picks a language → `POST /api/locale { locale: 'el' }` → sets `NEXT_LOCALE` cookie
2. Next.js reads the cookie on every server render via `getLocale()`
3. Root layout calls `getMessages()` → loads `messages/el.json`
4. `NextIntlClientProvider` wraps the entire app with those messages
5. Server components use `getTranslations('section')` → returns translated strings
6. Client components use `useTranslations('section')` → same strings, client-side

### Translation file structure

All files follow the same nested JSON structure. `en.json` is the source:
```json
{
  "auth": { "logIn": "Log In", "email": "Email", ... },
  "chatbot": { "askAnything": "Ask me anything about Crete", ... },
  "comingSoon": { "badge": "Coming Soon", "headline": "Something special...", ... },
  "thankYou": { "founding": "Founding Member", "position": "#{position}", ... },
  "nav": { "dashboard": "Dashboard", "explore": "Explore", ... }
}
```

### The golden rule: en.json is always edited first

Never add a key to `el.json` directly. Add it to `en.json`, then run the script.
The script finds missing keys and translates them automatically.

### Running the translation script

```bash
ANTHROPIC_API_KEY=sk-ant-... node scripts/translate.mjs
```

What it does:
1. Reads `messages/en.json`, flattens all keys
2. For each of the 10 other locales, finds keys present in English but missing locally
3. Sends batches of 20 key-value pairs to Claude with the target language
4. Claude returns translated JSON — preserving `{variables}`, never touching "valsamaki"
5. Writes the merged result back to the locale file

Never overwrites an existing translation — only fills gaps.

### CRITICAL: The brand name rule

The string `valsamaki` is ALWAYS a hardcoded literal in JSX:
```tsx
<p>valsamaki</p>   ← correct
<p>{t('brand')}</p>  ← NEVER do this
```
It must never be a translation key. It must never be changed for any locale.
No exceptions. This is a permanent rule.

### ICU variable format

When a translation string needs a dynamic value, use `{variableName}`:
```json
"joinCount": "Join {count} others already on the list",
"position": "#{position} on the waitlist"
```
Then in code:
```tsx
t('joinCount', { count: 42 })   // → "Join 42 others already on the list"
t('position', { position: 7 })  // → "#7 on the waitlist"
```
The translation script preserves these variable placeholders exactly.

---

## 10. Database — Every Table Explained

**Supabase Project ID:** `fnevubaewpmbsbokonaj`

### Tables

```
profiles
  id          UUID (FK → auth.users.id)
  name        TEXT
  role        TEXT  — 'guest' | 'user' | 'producer' | 'admin'
  language    TEXT  — preferred locale code
  preferences JSONB — dietary preferences, health goals, interests
  created_at  TIMESTAMPTZ

waitlist
  id          UUID PK
  email       TEXT UNIQUE (validated format)
  locale      TEXT — language the user was using when they signed up
  source      TEXT — 'coming_soon' | 'language_picker' | etc.
  created_at  TIMESTAMPTZ

businesses
  id          UUID PK
  name        TEXT
  description TEXT
  category    TEXT — 'olive_farm' | 'winery' | 'restaurant' | etc.
  lat         FLOAT, lng FLOAT — GPS coordinates
  is_active   BOOLEAN
  tags        TEXT[]
  owner_id    UUID (FK → profiles.id)

events
  id          UUID PK
  name        TEXT
  description TEXT
  category    TEXT
  lat         FLOAT, lng FLOAT
  start_date  TIMESTAMPTZ
  end_date    TIMESTAMPTZ
  is_active   BOOLEAN

ai_memory
  id          UUID PK
  user_id     UUID (FK → profiles.id)
  session_id  TEXT — groups messages within one conversation
  role        TEXT — 'user' | 'assistant'
  content     TEXT
  created_at  TIMESTAMPTZ

user_interactions
  id          UUID PK
  user_id     UUID
  entity_type TEXT — 'business' | 'event' | 'experience' | 'product'
  entity_id   TEXT
  action      TEXT — 'view' | 'like' | 'save' | 'click'
  created_at  TIMESTAMPTZ

knowledge_nodes
  id          TEXT PK
  label       TEXT
  topic       TEXT — 'olive_oil' | 'cardiovascular' | etc.
  description TEXT

knowledge_edges
  from_id     TEXT (FK → knowledge_nodes.id)
  to_id       TEXT (FK → knowledge_nodes.id)
  weight      FLOAT — relevance strength (0–1)

recommendations
  id          UUID PK
  user_id     UUID
  entity_id   TEXT
  entity_type TEXT
  score       FLOAT — 0 to 1
  reason      TEXT — AI-generated explanation
  expires_at  TIMESTAMPTZ — 1-hour TTL
```

### Row Level Security (RLS) rules

```
waitlist:
  SELECT → nobody (not even authenticated users — emails are private)
  INSERT → anon + authenticated (anyone can join)

profiles:
  SELECT → own row only
  UPDATE → own row only

ai_memory:
  SELECT → own rows only (user_id = auth.uid())
  INSERT → own rows only

businesses:
  SELECT → all (is_active = true for public)
  INSERT/UPDATE → own rows only (owner_id = auth.uid())
```

### RPC functions (callable from client)

```sql
get_waitlist_count() → BIGINT
  Security: DEFINER (runs as owner, not caller)
  Access: anon + authenticated
  Purpose: Public waitlist counter without exposing emails
```

### Running a migration

1. Write the SQL in `supabase/migrations/00N_description.sql`
2. Apply it via the Supabase dashboard SQL editor
3. If it adds new tables or columns, regenerate types:
   ```bash
   pnpm supabase:types
   ```
4. Update `types/database.ts` if needed (the script overwrites it)
5. Commit both the migration file AND the updated types

---

## 11. Environment Variables

Set all of these in Vercel → Project Settings → Environment Variables.

```
NEXT_PUBLIC_SUPABASE_URL          ← Supabase project URL (public, safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← Supabase anon key (public, RLS protects data)
ANTHROPIC_API_KEY                 ← Claude API key (server-only, never exposed to client)

# Optional — enables DeepSeek as fallback AI provider
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL                 ← default: https://api.deepseek.com/v1

# Optional — only needed for admin database operations bypassing RLS
SUPABASE_SERVICE_ROLE_KEY         ← NEVER expose to client, NEVER commit to git
```

**Local development** — copy to `.env.local` (already in `.gitignore`):
```bash
cp .env.example .env.local
# fill in the values
```

---

## 12. Deployment Process

### Auto-deployment (normal workflow)

```
git add .
git commit -m "feat: description"
git push origin main
      ↓
Vercel detects push → triggers build
      ↓
next build (TypeScript check + bundle)
      ↓
Deploy to production (valsamaki.eu)
      ↓
Takes 1–3 minutes
```

Check build status at: vercel.com/dashboard

### What Vercel runs

```bash
pnpm install      # install dependencies
next build        # TypeScript compilation + bundle
next start        # start production server
```

### If a build fails

1. Go to vercel.com → Valsamaki project → Deployments
2. Click the failed deployment → read the build log
3. Fix locally: `npx tsc --noEmit` to catch TypeScript errors
4. Push the fix — Vercel will retry automatically

### Domain setup

`valsamaki.eu` → Vercel (DNS A record points to Vercel's servers)
`www.valsamaki.eu` → redirects to `valsamaki.eu`

---

## 13. Development Workflow

### Local setup

```bash
git clone https://github.com/AmbroseJunior/Valsamaki.git
cd Valsamaki
pnpm install
cp .env.example .env.local   # add your keys
pnpm dev                     # http://localhost:3000
```

### Before committing

```bash
npx tsc --noEmit   # TypeScript check — must pass
```

### Branch strategy

- `main` → production (valsamaki.eu)
- Always push directly to `main` for now (single developer)
- At scale: use feature branches → PR → merge to main

---

## 14. Security Measures

Every security decision follows OWASP Top 10 guidelines:

| Threat | Defence |
|--------|---------|
| A01 Broken Access Control | Middleware role gate on every request; RLS on all tables |
| A02 Cryptographic Failures | Supabase handles auth tokens; no custom crypto |
| A03 Injection | `validateString()` on all inputs; parameterised queries via Supabase SDK |
| A04 Insecure Design | Admin access via server-side role check only; no client-side gates |
| A05 Security Misconfiguration | `applySecurityHeaders()` on every response; no debug mode in prod |
| A07 Auth Failures | Rate limiting on all sensitive routes (3–20 req/min per IP) |
| Open Redirect | `safeNext()` validates redirect paths — only relative paths allowed |

### Rate limits

```
POST /api/waitlist       → 3 requests / 60 seconds per IP
POST /api/ai/chat        → 20 requests / 60 seconds per user
POST /api/ai/voice-setup → 10 requests / 60 seconds per user
```

---

## 15. Common Tasks — Step by Step

### Add a new page to the app

```bash
1. Create: app/(user)/newpage/page.tsx
2. Add nav link in: components/shared/Navbar.tsx + BottomNav.tsx
3. Add i18n key to messages/en.json:
   "nav": { "newpage": "New Page" }
4. Run: ANTHROPIC_API_KEY=... node scripts/translate.mjs
5. npx tsc --noEmit
6. git add . && git commit && git push
```

### Add a new API endpoint

```bash
1. Create: app/api/endpoint/route.ts
2. Import rateLimit + validateString from @/lib/security
3. Apply auth check: createClient() → getUser() → 401 if no user
4. Apply rate limit at the top of the handler
5. npx tsc --noEmit && git push
```

### Add a new food to the knowledge base

```bash
1. Open data/foods.csv — add row:
   food_id,name,description,category,is_cretan
   33,"Carob","Rich dark Mediterranean legume...","legume",true

2. Open data/food_details.csv — add flavour/preparation/history
3. Open data/compounds.csv — add its bioactive compounds
4. Open data/nutrition.csv — add nutritional highlights
5. Open data/food_health_goals.csv — map to health goals with evidence level
6. Open data/studies.csv — add any peer-reviewed studies

7. git add data/ && git commit && git push
   → RAG picks up changes automatically on next deploy
```

### Add a new language

```bash
1. lib/i18n/locales.ts:
   Add to SUPPORTED_LOCALES: [..., 'ja']
   Add to LOCALE_LABELS: ja: '日本語'
   Add to LOCALE_FLAGS: ja: '🇯🇵'

2. Create messages/ja.json: {}  (empty — script will fill it)

3. Run: ANTHROPIC_API_KEY=... node scripts/translate.mjs
   → translates all ~400 keys into Japanese

4. npx tsc --noEmit && git push
```

### Update an existing translation

```bash
1. Edit the English value in messages/en.json
2. Delete the corresponding key from the target locale file (e.g. el.json)
3. Run: ANTHROPIC_API_KEY=... node scripts/translate.mjs
   → fills in the deleted key with a fresh translation
```

### Grant admin access

```sql
-- Run in Supabase SQL editor
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'new-admin@email.com');
```

### Open the app for public launch

```bash
# In middleware.ts, remove the entire gate block:

# DELETE these lines:
  if (isBypass) {
    if (isAuthRoute && user) { ... }
    return response
  }
  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/coming-soon', request.url))
  }

# KEEP: the standard public/private route logic below it

# Also restore the login page to show register tab (already done)
# Also: notify waitlist users via email (Resend / Loops)
```

---

## 16. Scaling Plan (Pre-Launch → Launch → Growth)

### Phase 1: Pre-launch (current)
- ✅ Waitlist collecting emails
- ✅ Admin can build + test the full app
- ✅ 11 languages supported
- ✅ AI chatbot with Cretan food RAG
- ✅ Knowledge base (228 KB of peer-reviewed data)

### Phase 2: Soft launch
- [ ] Remove maintenance gate from `middleware.ts`
- [ ] Enable public registration (login page already has register tab)
- [ ] Send launch email to waitlist (Resend API + `scripts/notify-waitlist.mjs`)
- [ ] Set up onboarding flow for new users (`app/onboarding/page.tsx` exists)
- [ ] Run `node scripts/translate.mjs` one final time

### Phase 3: Producer onboarding
- [ ] Enable producer registration (role selection on sign-up)
- [ ] Producer dashboard (`/business`, `/analytics`) — routes exist, unlock them
- [ ] Voice listing tool (`/api/ai/voice-setup`) — producers describe business by voice

### Phase 4: Scale infrastructure
- [ ] Supabase pgvector → embed CSV chunks → true vector RAG (replaces keyword scoring)
- [ ] Supabase Realtime → live event feeds, live market updates
- [ ] Add Stripe → producer subscription billing
- [ ] CDN for images (Supabase Storage or Cloudinary)
- [ ] Supabase Edge Functions for latency-sensitive operations
- [ ] Monitoring: Sentry for errors, PostHog for analytics

### Phase 5: Mobile
- [ ] The app is already a PWA — add to home screen works now
- [ ] React Native wrapper (Expo) if native app store presence needed
- [ ] Push notifications via web push API

---

## 17. Troubleshooting

### "Something went wrong" on email submission
- Check: is the waitlist RLS INSERT policy applied? (migration 006)
- Check: `/api/waitlist/count` returns a number (not an error)
- Check: Vercel function logs for the specific error

### Translation keys showing as raw text (e.g. `comingSoon.headline`)
- The locale files don't have that key yet
- Run: `ANTHROPIC_API_KEY=... node scripts/translate.mjs`
- Commit and push the updated locale files

### Middleware redirecting to `/login` when it should show `/coming-soon`
- The bypass route list in `middleware.ts` must include the affected path
- Bypass routes MUST return immediately — they cannot fall through to the auth wall

### TypeScript error after adding a Supabase function
- Add the function signature to `types/database.ts` under `Functions`
- Or run `pnpm supabase:types` to regenerate (requires Supabase CLI)

### Vercel build fails
- Run `npx tsc --noEmit` locally first — fix all errors before pushing
- Check that all imported components exist and are exported correctly

### AI responses are in English despite user choosing Greek
- Check that the locale cookie is being set via `POST /api/locale`
- Check that `context.locale` is being passed to the provider's `buildSystemMessage`
- The language instruction block at the bottom of the system prompt must say "Respond ONLY in Greek"
