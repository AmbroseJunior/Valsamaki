# Valsamaki — Architecture Guide

## What this is

Valsamaki is a Next.js 14 app that connects users with authentic Cretan producers, food science,
events, and experiences. It is currently in **pre-launch mode**: only the admin can access the full
app. Everyone else sees a waitlist page, chooses their language, and submits their email.

---

## Quick orientation

```
Stack:     Next.js 14 (App Router) · TypeScript · Tailwind CSS
Database:  Supabase (Postgres + Auth + RLS)
AI:        Claude (Anthropic) / DeepSeek — multi-provider with fallback
i18n:      next-intl — 11 languages (en, el, de, fr, it, es, nl, pt, ru, zh, ar)
Deploy:    Vercel (auto-deploys on push to main)
```

---

## Folder map

```
app/
  (auth)/login/        → Admin-only login page (no public registration)
  (guest)/             → Public home (blocked by middleware for non-admins)
  (user)/              → All user-facing pages (dashboard, chatbot, explore, map…)
  (producer)/          → Producer pages (business, analytics)
  api/                 → All API routes
  coming-soon/         → Waitlist page — the ONLY page non-admins see
  thank-you/           → Post-signup confirmation

components/
  ai/                  → Chatbot UI, VoiceInput, AICard
  shared/              → Navbar, BottomNav, LoadingSpinner, etc.
  ui/                  → Headless primitives (button, card, input)
  map/                 → Map components

lib/
  ai/
    rag.ts             → RAG — retrieves relevant food knowledge for each query ← KEY FILE
    cretan-knowledge.ts → Legacy full-dump (kept for backward compat, not used in chat)
    mcp-bridge.ts      → Orchestrates AI providers with fallback
    local-context.ts   → Builds per-request AI context (user profile, nearby places, memory)
    knowledge-graph.ts → Graph traversal for related food topics
    providers/
      claude.ts        → Claude (Anthropic) provider — uses RAG
      deepseek.ts      → DeepSeek provider — uses RAG
  supabase/
    server.ts          → createClient() (anon) and createServiceClient() (service role)
    client.ts          → Browser-side Supabase client
    middleware.ts      → Session + role extraction for middleware.ts
  i18n/locales.ts      → List of 11 supported locales + labels + flags
  security.ts          → Rate limiting, input validation (OWASP)

data/                  → CSV knowledge base (228 KB, peer-reviewed scientific data)
  foods.csv            → Food definitions
  compounds.csv        → Bioactive compounds
  health_goals.csv     → Health benefit categories
  food_health_goals.csv → Food ↔ health goal mappings with evidence strength
  nutrition.csv        → Nutritional highlights
  studies.csv          → Peer-reviewed study citations
  food_details.csv     → Flavour, preparation, historical use
  ui_copy.csv          → UI strings (not used in RAG)

messages/              → i18n translation files (one JSON per locale)
  en.json              → SOURCE OF TRUTH — always edit this first
  el.json, de.json…    → Derived — run scripts/translate.mjs to sync

scripts/
  translate.mjs        → Auto-translate missing keys using Claude API
  add-locale-translations.js → Manual bulk key addition (legacy)

supabase/
  migrations/          → SQL migration files (run in order: 001, 002, …)

types/
  database.ts          → Generated Supabase types (run pnpm supabase:types to regenerate)
  ai.ts                → AI types (MCPRequest, AIContext, AIMessage…)
  roles.ts             → Role hierarchy: guest < user < producer < admin
```

---

## Access control

```
middleware.ts controls ALL routing:

Non-admin users  →  /coming-soon  (waitlist flow only)
Admin user       →  full app access

Bypass list (accessible without admin role):
  /coming-soon, /thank-you, /login, /auth, /api/*

The admin is identified by role = 'admin' in the Supabase profiles table.
Only one admin: nadis2u@gmail.com
```

---

## User flow (current, pre-launch)

```
Any visitor
    ↓
middleware.ts → not admin? → /coming-soon
    ↓
Step 1: Choose language (11 options, no skip)
    ↓  (sets locale cookie via /api/locale, sets sessionStorage key)
Step 2: Waitlist email form (translated to chosen language)
    ↓  (POST /api/waitlist → Supabase waitlist table)
/thank-you?p={position}  (founding member + position number)
```

---

## AI / RAG architecture

```
User message
    ↓
POST /api/ai/chat
    ↓
mcpBridge()
    ├── buildLocalContext()  → user profile, conversation history, nearby places
    └── runWithFallback()    → tries Claude, then DeepSeek
            ↓
    provider.chat(messages, context)
            ↓
    buildSystemMessage(context, userQuery)
            ├── retrieveRelevantKnowledge(userQuery, 8)  ← RAG from /data CSVs
            │   Scores all foods against query keywords,
            │   returns only the top-8 most relevant sections.
            ├── Nearby businesses + events (from Supabase geospatial query)
            └── User preferences + conversation memory
            ↓
    LLM response (grounded in verified Cretan food science)
```

### How RAG works (`lib/ai/rag.ts`)

1. CSVs are parsed once on first call and held in memory.
2. Keywords extracted from the user query (stop-words removed).
3. Each food item is scored: name match (+10), description (+3), health goal (+5),
   bioactive compound (+4), nutrition (+3).
4. Top-8 foods by score are formatted into structured blocks and injected into the prompt.
5. For generic queries (no keywords), the first 8 foods are returned as a broad overview.

**To add new foods**: add rows to the CSV files in `/data/`. The RAG picks them up
automatically on next server restart / deployment. No code changes needed.

---

## How to translate new content

Whenever you add new keys to `messages/en.json`:

```bash
ANTHROPIC_API_KEY=sk-... node scripts/translate.mjs
```

The script:
- Finds keys present in en.json but missing in each of the 10 other locale files
- Translates them in batches of 20 using Claude
- Never overwrites existing translations
- Never translates the brand name "valsamaki"
- Preserves `{variables}` in ICU message format

**Rules for en.json**:
- Always add new keys to en.json first
- Never use translation keys for "valsamaki" — it must always be a hardcoded string
- Use ICU format for variables: `"joinCount": "Join {count} others on the list"`

---

## Database (Supabase)

Project ID: `fnevubaewpmbsbokonaj`

Key tables:
```
profiles         id, name, role, language, preferences
waitlist         id, email, locale, source, created_at
businesses       id, name, category, lat, lng, is_active, tags
events           id, name, category, lat, lng, start_date, is_active
ai_memory        user_id, session_id, role, content, created_at
user_interactions user_id, entity_type, entity_id, action, created_at
knowledge_nodes  id, label, topic, description
knowledge_edges  from_id, to_id, weight
recommendations  user_id, entity_id, entity_type, score, reason, expires_at
```

RPC functions:
```
get_waitlist_count()  → bigint   (security-definer, accessible by anon)
```

**To add a migration**:
1. Create `supabase/migrations/00N_description.sql`
2. Apply via Supabase dashboard or MCP tool

**To regenerate TypeScript types**:
```bash
pnpm supabase:types
```

---

## Environment variables

```
# Required in Vercel
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY           ← for Claude AI provider + translation script

# Optional (enables DeepSeek fallback)
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL           ← default: https://api.deepseek.com/v1

# Server-only (not required — anon key + RLS is the default)
SUPABASE_SERVICE_ROLE_KEY
```

---

## Common tasks

### Add a new page
1. Create `app/(user)/pagename/page.tsx`
2. Add route to Navbar if needed
3. Add i18n keys to `messages/en.json`, then run `scripts/translate.mjs`

### Add a new API route
1. Create `app/api/routename/route.ts`
2. Apply rate limiting from `lib/security.ts`
3. API routes are NOT affected by the maintenance gate (they handle their own auth)

### Update the knowledge base (new food, new study, new compound)
1. Add rows to the relevant CSV files in `/data/`
2. Restart the dev server (or deploy) — cache invalidates automatically
3. No code changes needed

### Add a new locale
1. Add to `SUPPORTED_LOCALES` in `lib/i18n/locales.ts`
2. Add label + flag to `LOCALE_LABELS` and `LOCALE_FLAGS`
3. Create `messages/XX.json` (copy from en.json, clear values)
4. Run `scripts/translate.mjs`

### Grant admin access to a new user
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

---

## Deployment

- Push to `main` → Vercel auto-deploys (typically 1–2 minutes)
- No build step needed locally — Vercel runs `next build`
- Check deployment logs at vercel.com if something breaks

---

## Scaling checklist (for launch)

- [ ] Remove the maintenance gate from `middleware.ts` (delete the under-construction block)
- [ ] Enable public registration in the login page (`app/(auth)/login/page.tsx`)
- [ ] Set up Supabase pgvector for embeddings-based RAG (upgrade from keyword scoring)
- [ ] Add Stripe for producer subscriptions
- [ ] Enable Supabase Realtime for live event feeds
- [ ] Set up email sending for waitlist launch notification (use Resend or Loops)
- [ ] Run `scripts/translate.mjs` one final time before launch
