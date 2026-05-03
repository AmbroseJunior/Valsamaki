# VALSAMAKI.APP 🫒

**Discover authentic Cretan producers, events, and the Mediterranean diet with AI-powered local guidance**

VALSAMAKI.APP is a full-stack Progressive Web App (PWA) built for Crete, Greece. It connects travellers and locals with authentic Cretan producers, cultural events, and the Mediterranean diet — all guided by a context-aware AI assistant that understands your location, preferences, and conversation history.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Getting Started](#3-getting-started)
4. [Database Setup](#4-database-setup)
5. [Environment Variables](#5-environment-variables)
6. [Development Workflow](#6-development-workflow)
7. [Project Structure](#7-project-structure)
8. [Key Concepts](#8-key-concepts)
9. [Deployment](#9-deployment)
10. [Contributing](#10-contributing)

---

## 1. Project Overview

### Features

**For users (visitors & locals)**

- Browse and search authentic Cretan producers and businesses on an interactive map
- Discover local events filtered by date, category, and proximity
- Chat with an AI assistant that knows what is near you, what is in season, and what Cretan cuisine is all about
- Voice input in Greek via OpenAI Whisper transcription
- Personalised onboarding capturing dietary preferences, interests, and location consent
- Dashboard with live weather, trending businesses, and local news
- Full offline support — the app works without a network connection and syncs when back online

**For producers (business owners)**

- Manage a business profile, product listings, and event postings
- View an analytics dashboard (visits, interactions, reach)
- Run self-serve advertising campaigns

**Platform**

- Progressive Web App — installable on iOS, Android, and desktop
- Bilingual interface: English and Greek (el/en) with next-intl
- Role-based access: `user` and `producer` roles with middleware-enforced route protection
- Real-time location pings over Supabase WebSocket channels

---

## 2. Architecture Overview

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.29 — App Router, Server Actions |
| Language | TypeScript 5.9.3 (strict mode) |
| Styling | Tailwind CSS v3 with a custom Mediterranean colour palette |
| Database | Supabase (PostgreSQL) — project ref `fnevubaewpmbsbokonaj` |
| Auth | Supabase Auth with `@supabase/ssr` cookie-based sessions |
| Realtime | Supabase Realtime WebSocket channels |
| Storage | Supabase Storage |
| AI (primary) | DeepSeek API |
| AI (fallback) | Anthropic Claude, Google Gemini |
| Voice | OpenAI Whisper API (Greek transcription) |
| Offline | sql.js (SQLite in-browser) with a background sync queue |
| Maps | Leaflet |
| Data fetching | @tanstack/react-query |
| i18n | next-intl 4.x |
| PWA | next-pwa (service worker, manifest) |

### Key Design Decisions

**Offline-first.** Every page that fetches data writes results into an in-browser SQLite database (via sql.js). Mutations are queued locally and replayed against Supabase once connectivity is restored. This makes the app fully functional in areas of Crete with poor signal.

**AI context pipeline.** Before each AI response the server assembles a rich context object: nearby businesses (by GPS coordinates), upcoming events, the user's dietary preferences, and the last N turns of conversation history. This context is injected into the system prompt so the AI gives hyper-local, personalised answers without requiring the user to repeat themselves.

**Knowledge graph for Mediterranean diet.** A `knowledge_nodes` + `knowledge_edges` table pair stores structured facts about Cretan ingredients, producers, recipes, and nutritional relationships. The AI assistant queries this graph to ground its answers in verified local knowledge rather than relying solely on training data.

**Role-based middleware.** Next.js middleware intercepts every request, refreshes the Supabase session, reads the user's role from the JWT claims, and enforces which routes are accessible — preventing a `user` from accessing `/business` or `/analytics`.

**MCP bridge.** An internal Model Context Protocol bridge serialises long-term user preferences and AI memory into a format the language models can consume, enabling coherent multi-session conversations.

---

## 3. Getting Started

### Prerequisites

- **Node.js** >= 18.17 (LTS recommended)
- **pnpm** >= 9 — install with `npm i -g pnpm`
- A **Supabase** project (free tier works for development)
- API keys for DeepSeek and OpenWeatherMap (see [Environment Variables](#5-environment-variables))

### Clone and Install

```bash
git clone https://github.com/<your-org>/valsamaki-app.git
cd valsamaki-app
pnpm install
```

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#5-environment-variables) for the full reference. At minimum you need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DEEPSEEK_API_KEY` to run the app locally.

### Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Hot module replacement is enabled.

---

## 4. Database Setup

### Apply Migrations

The `supabase/` directory contains all schema migrations. Install the Supabase CLI, link your project, and push:

```bash
# Install Supabase CLI (once)
npm i -g supabase

# Log in and link to your project
supabase login
supabase link --project-ref fnevubaewpmbsbokonaj

# Apply all pending migrations
supabase db push
```

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Extended user data — role, preferences, last known location |
| `businesses` | Producer business listings |
| `events` | Local events posted by producers or admins |
| `user_interactions` | Clicks, saves, ratings — used for recommendations |
| `recommendations` | Pre-computed or AI-generated recommendations per user |
| `ai_memory` | Serialised conversation context and long-term preferences |
| `knowledge_nodes` | Nodes in the Mediterranean diet knowledge graph |
| `knowledge_edges` | Directed relationships between knowledge nodes |

### Generate TypeScript Types

After schema changes, regenerate the TypeScript types so the codebase stays in sync:

```bash
supabase gen types typescript \
  --project-id fnevubaewpmbsbokonaj \
  --schema public \
  > types/supabase.ts
```

### Row-Level Security

All tables have RLS enabled. Policies enforce that:

- Users can only read and update their own `profiles` row.
- Only producers can insert/update `businesses` and `events`.
- `ai_memory` rows are private to the owning user.
- `knowledge_nodes` and `knowledge_edges` are publicly readable.

Review the migration files in `supabase/migrations/` for the full policy definitions.

---

## 5. Environment Variables

Create a `.env.local` file at the project root with the following variables:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key — server-side only, never expose to the client |
| `DEEPSEEK_API_KEY` | Yes | DeepSeek API key for the primary AI provider |
| `OPENAI_API_KEY` | No | OpenAI API key — required only for Greek voice transcription via Whisper |
| `OPENWEATHERMAP_API_KEY` | Yes | OpenWeatherMap API key for the dashboard weather widget |
| `NEWS_API_KEY` | Yes | NewsAPI key for the local news feed on the dashboard |

Variables prefixed with `NEXT_PUBLIC_` are bundled into the client. All others are server-only. Never commit `.env.local` to version control — it is listed in `.gitignore`.

---

## 6. Development Workflow

### Common Commands

```bash
# Start development server with hot reload
pnpm dev

# Type-check the entire project without emitting files
pnpm tsc --noEmit

# Production build (also used for pre-deploy checks)
pnpm build

# Start the production server locally (after build)
pnpm start

# Lint with ESLint
pnpm lint
```

### Adding i18n Strings

Translation files live in `messages/en.json` and `messages/el.json`. When adding a new UI string:

1. Add the key to both files.
2. Use `useTranslations` (client components) or `getTranslations` (server components) from `next-intl`.
3. The locale is determined by the `[locale]` route segment or the `Accept-Language` header.

### Working with the AI Pipeline

The AI context builder is in `lib/ai/`. When modifying prompts or adding new context sources:

1. Update the context assembler to include the new data.
2. Add corresponding TypeScript types in `types/`.
3. Test with the `/chatbot` route in development — the full context is logged to the server console at `DEBUG` level when `NODE_ENV=development`.

---

## 7. Project Structure

```
valsamaki-app/
├── app/                        # Next.js App Router
│   ├── [locale]/               # Locale-prefixed routes (en / el)
│   │   ├── page.tsx            # / — guest landing page
│   │   ├── login/              # /login
│   │   ├── register/           # /register
│   │   ├── onboarding/         # /onboarding — post-signup preferences
│   │   ├── dashboard/          # /dashboard — weather, trending, news
│   │   ├── explore/            # /explore — discover businesses
│   │   ├── events/             # /events — event feed
│   │   ├── map/                # /map — interactive Leaflet map
│   │   ├── chatbot/            # /chatbot — AI assistant
│   │   ├── business/           # /business — producer profile management
│   │   ├── analytics/          # /analytics — producer analytics
│   │   └── advertise/          # /advertise — producer advertising
│   ├── api/                    # Route handlers (AI, auth, location, etc.)
│   └── layout.tsx              # Root layout — providers, fonts
│
├── components/                 # React components
│   ├── ai/                     # Chatbot UI, voice input, message bubbles
│   ├── dashboard/              # Weather widget, news feed, trending cards
│   ├── events/                 # Event cards, filters, calendar view
│   ├── map/                    # Leaflet map wrapper, marker clusters
│   ├── producers/              # Business cards, product listings
│   ├── shared/                 # Layout shell, navigation, breadcrumbs
│   └── ui/                     # Primitive UI components (buttons, modals, etc.)
│
├── lib/                        # Business logic and server utilities
│   ├── ai/                     # Context builder, prompt templates, MCP bridge
│   ├── location/               # GPS tracking, IP fallback, coordinate helpers
│   ├── offline/                # sql.js SQLite client, sync queue manager
│   ├── supabase/               # Typed Supabase clients (server, client, admin)
│   └── websocket/              # Supabase Realtime channel helpers
│
├── types/                      # TypeScript type definitions
│   ├── supabase.ts             # Auto-generated from Supabase schema
│   └── *.ts                    # Domain types (business, event, ai, etc.)
│
├── messages/                   # i18n translation files
│   ├── en.json                 # English strings
│   └── el.json                 # Greek strings
│
├── styles/                     # Global CSS and design tokens
│   └── tokens.css              # Mediterranean colour palette CSS variables
│
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # App icons (all sizes)
│   └── images/                 # Static images and illustrations
│
├── supabase/                   # Supabase project files
│   └── migrations/             # Timestamped SQL migration files
│
├── middleware.ts               # Session refresh + role-based route protection
├── next.config.mjs             # Next.js configuration (next-pwa, i18n, etc.)
├── tailwind.config.ts          # Tailwind configuration with custom theme
└── tsconfig.json               # TypeScript configuration (strict mode)
```

---

## 8. Key Concepts

### AI Pipeline

When a user sends a message in `/chatbot`, the server route handler in `app/api/` first calls the context builder in `lib/ai/`. The context builder queries Supabase for businesses and events within a configurable radius of the user's last known coordinates, retrieves recent turns of conversation history from `ai_memory`, and merges the user's dietary preferences from `profiles`. This assembled context is prepended as a system message to the DeepSeek API call. If DeepSeek is unavailable, the request falls through to Claude and then Gemini. Responses are streamed back to the client.

### Offline Mode

On first load the service worker (generated by next-pwa) caches all static assets and pre-fetches critical API responses. When the user navigates while offline, `lib/offline/` intercepts data requests and serves results from an in-browser SQLite database managed by sql.js. Write operations (such as saving a business or submitting a rating) are appended to a sync queue stored in IndexedDB. A background service worker listener fires when the network is restored and replays queued mutations against the Supabase API in order, handling conflicts with last-write-wins semantics.

### Location Tracking

On pages that require location context (`/map`, `/explore`, `/chatbot`), `lib/location/` requests the browser Geolocation API. If the user denies permission or the API is unavailable, it falls back to IP geolocation. The resolved coordinates are pushed to the user's `profiles` row via a Supabase Realtime channel, allowing the server to keep AI context and proximity queries accurate without a full page reload. Location updates are debounced to avoid excessive database writes.

### Knowledge Graph

The `knowledge_nodes` table stores entities such as Cretan ingredients (Graviera cheese, Tsikoudia, Cretan olive oil), traditional recipes, and nutritional concepts. The `knowledge_edges` table stores typed relationships between nodes (for example `IS_INGREDIENT_OF`, `PRODUCED_IN`, `PAIRS_WITH`). Before composing an AI system prompt, the context builder traverses relevant subgraphs — starting from nodes matching the user's query or current location — and serialises the resulting triples into structured prose that the language model can cite. This grounds answers in verified Cretan food knowledge and reduces hallucination of local product details.

---

## 9. Deployment

The application is designed to deploy on **Vercel** with zero additional infrastructure.

### Deploy to Vercel

```bash
# Install Vercel CLI (once)
npm i -g vercel

# Deploy from the project root
vercel --prod
```

Alternatively, connect the GitHub repository to a Vercel project and enable automatic deployments on push to `main`.

### Environment Variables on Vercel

Add all variables from the [Environment Variables](#5-environment-variables) table to your Vercel project under **Settings > Environment Variables**. Set each variable for the **Production**, **Preview**, and **Development** environments as appropriate.

`SUPABASE_SERVICE_ROLE_KEY` and `DEEPSEEK_API_KEY` must never be prefixed with `NEXT_PUBLIC_` — they are server-only secrets.

### Edge Middleware

`middleware.ts` runs on Vercel's Edge Runtime. It adds minimal latency for session validation and is region-agnostic. If you are self-hosting, ensure your deployment target supports the Next.js Edge Runtime.

### PWA in Production

The service worker is only registered in production builds (`NODE_ENV=production`). Run `pnpm build && pnpm start` locally to test the full PWA behaviour, including offline caching and the install prompt.

---

## 10. Contributing

Contributions are welcome. Please follow these guidelines:

1. **Branch naming**: use `feature/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`.
2. **Commits**: write clear, imperative commit messages (e.g. `add voice input to chatbot`). Reference issue numbers where applicable.
3. **TypeScript**: all new code must be strictly typed. Do not use `any` — use `unknown` and narrow the type explicitly.
4. **i18n**: any user-facing string must have entries in both `messages/en.json` and `messages/el.json`.
5. **Pre-PR checks**: run `pnpm tsc --noEmit` and `pnpm lint` before opening a pull request. Both must pass.
6. **Pull requests**: target the `main` branch. Fill in the PR description with a summary and test steps.

For questions about Mediterranean diet knowledge graph content or Cretan cultural accuracy, open an issue tagged `content`.

---

*Built with care for the island of Crete.*
