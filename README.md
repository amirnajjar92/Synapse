# Synapse — AI-Powered Fitness & Health OS

> **Full-stack intelligent fitness companion.** Plan, track, analyze, and adapt your training with an AI coach that knows your body, your goals, and your progress — all running as a mobile-first PWA with real-time trainer collaboration.

---

## Quick Identity

| Attribute | Value |
|---|---|
| **Tagline** | Your AI fitness brain. |
| **Platform** | Progressive Web App (iOS/Android/Desktop) |
| **Architecture** | Mobile-first, dark-mode, gesture-driven UI |
| **Auth** | Google OAuth via NextAuth |
| **AI Engine** | OpenAI GPT-4o / Claude Sonnet (multi-provider fallback) |
| **Database** | PostgreSQL via Prisma + Vercel Postgres Data Proxy |
| **Real-time** | Pusher (chat, notifications) + Web Push API (system notifications) |
| **Deployment** | Vercel (Next.js SSR + Edge) |
| **PWA** | Offline-capable, installable, push notifications, background sync |

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, SSR/SSG hybrid, Turbopack)
- **React 19** with hooks, Suspense, Server Components
- **Tailwind CSS** — utility-first dark-mode design system
- **Redux Toolkit** — plan & state management
- **lucide-react** — icon system
- **jspdf** + **jspdf-autotable** — PDF export (progress reports)
- **Framer Motion** / CSS animations — micro-interactions

### Backend & Data
- **Next.js API Routes** — serverless functions per feature domain
- **Prisma** — type-safe ORM with PostgreSQL
- **Vercel Postgres** — pooled data proxy connection
- **NextAuth.js** — Google OAuth with Prisma adapter

### Real-Time & Notification Stack
- **Pusher** (channels + server SDK) — real-time chat, notifications
- **Web Push API** (VAPID) — system push notifications via Service Worker
- **Service Worker** (Workbox, auto-generated + custom push injection)

### AI & Search
- **OpenAI GPT-4o** (primary) / **Claude** (fallback) — plan generation, analysis, chat
- **Custom AI agents**: prompt enhancer, plan progress analyst, daily check-in analyzer
- **YouTube Data API v3** — exercise video search
- **Google Programmable Search** — fitness events & news

### Integrations
- **Strava API** — activity import (running, cycling, swimming)
- **Google OAuth** — authentication
- **Pusher** — real-time bidirectional messaging

### External Services (configured via env)
- OpenAI / Claude AI providers
- YouTube Data API
- Google Custom Search
- Pusher Channels
- Strava API
- NextAuth Google provider
- VAPID web-push keys

---

## Core Features

### 🧠 AI Coach — Intelligent Plan Generation
- Natural language prompt → structured multi-week workout plan
- Context-aware: considers goals, experience, available equipment, schedule
- AI modifies existing plans (add/remove exercises, swap days, adjust intensity)
- AI analyzes daily check-in entries, compares actual vs planned progress
- PDF report generation with AI-powered narrative summary
- Multi-provider fallback (OpenAI → Claude) for reliability

### 📋 Workout Planner & Tracker
- Visual plan builder with table editor (day/focus/exercises/duration)
- Day-by-day workout tracking with exercise completion checkboxes
- Dropdown exercise selector with YouTube video search per exercise
- Coach tip area (AI-generated daily advice based on plan + progress)
- Anatomical 3D muscle maps (front/back view for men & women)
- Interactive muscle group reference with exercise recommendations
- PDF export of full workout plan + progress

### 📊 Progress Monitor
- Daily check-in form: mood, energy, sleep, soreness, weight, notes
- Visual progress charts (weight trends, comparison bars)
- AI analysis of check-in entries with natural-language feedback
- Side-by-side "planned vs actual" comparison
- Bar charts for tracked metrics over time
- PDA (Plan Deviation Analysis) — AI identifies gaps & suggests adjustments

### 👟 Activity Tracking
- **Strava integration** — auto-import runs, rides, swims
- Manual activity logging fallback
- Pace/distance/duration metrics with format helpers
- Activity feed with polyline route maps

### 💧 Water Tracker
- Daily hydration logging with glass counter
- Interval-based reminder system (configurable minutes)
- Streak tracking & progress visualization
- Monthly history with day-by-day compliance

### 🏋️ Training Studio (Trainer Portal)
- **Client management** — add, remove, assign plans, track status
- **Invitation system** — invite clients via email, accept/decline flow
- **Plan builder** — AI-powered workout plan creation
- **Client messaging** — real-time 1-on-1 chat per client
- **Unread message badges** — per-client + aggregated sidebar badge
- **Push notifications** — web-push + in-app toasts for new messages
- **Repository** — saved templates and completed plans

### 💬 Real-Time Chat
- Pusher-powered bidirectional messaging
- Conversation management (multi-client support)
- System notifications for new messages (background/closed app)
- Push notification test panel (local → push → pusher sequence)
- Sent message deletion (long-press → trash)

### 🔔 Notification System
- **Push Notification Manager** — auto-subscribes Service Worker on load
- **Pusher Notification Listener** — cross-page in-app toast + system notification
- **Reminder Settings** — configurable workout, hydration, activity reminders
- **Daily Plan Notifier** — scheduled notification with today's workout summary
- **Notification Bell** — invitation alerts in sidebar
- **3-tier delivery**: Pusher (in-app) → Web Push (SW) → Local fallback

### 🥗 Nutrition & Health
- Meal logging interface
- Calorie tracking
- Weight goal parsing from natural language ("Lose 5kg in 2 months")
- Weight entry trend visualization

### 🔐 Authentication & User
- Google OAuth single sign-on
- Session management via NextAuth
- User profile with avatar, name, email
- Admin role for trainer privileges
- Role-based access (trainer vs client views)

### 📱 PWA Features
- Installable on iOS/Android home screen
- Offline-capable via Workbox service worker
- Push notification support (mobile + desktop)
- Apple touch icons & splash screens (all sizes)
- Portrait-primary orientation lock
- Dark theme with dynamic theme-color meta tag
- PWA update detection & installer prompt

### 🎨 UI/UX
- Mobile-first iPhone-mockup layout (402×874px viewport)
- Dark theme with black backgrounds + orange (#FC4C02) accent
- Burger menu sidebar with navigation + invitation bell + unread badges
- Bottom floating navigation bar for primary actions
- Smooth animations, skeleton loaders, gesture-driven interactions
- Full set of reusable components (buttons, inputs, sheets, tables, skeletons)
- Animated logo (SynapseFit) with rotation + pulse effects

### 🔍 Discover & Learn
- **Entertain tab**: News, events, videos, playlists grid (Google Search + YouTube)
- **Events tab**: Fitness event discovery with web-view modal
- **Muscle Reference**: Interactive anatomy explorer with exercise recommendations
- **Video Player Modal**: In-app exercise technique demonstrations

---

## AI System Architecture

Synapse uses a **multi-agent AI approach** with specialized agents per domain:

1. **Plan Generator** (`useMakePlan`, `useWorkoutPlanner`) — Takes natural language goals and outputs structured JSON workout plans with day/focus/exercise/duration tables
2. **Plan Modifier** (`usePlanModifier`) — Edits existing plans via conversation (add/remove exercises, swap weeks, adjust volume)
3. **Prompt Enhancer** (`usePromptEnhancer`) — Enriches user prompts with context (goals, history, equipment) before sending to the AI
4. **Progress Analyst** (`useAnalysePlanProgress`) — Analyzes daily check-in data, compares to plan, generates deviation reports
5. **Coach** — Generates daily advice based on current day's plan + user's progress
6. **AIAssistantSheet / AIAssistantModal** — Context-aware chat assistant on any page

All AI calls route through `src/app/api/ai/` with automatic fallback between providers.

---

## Data Model (Core Entities)

| Model | Purpose |
|---|---|
| `User` | Auth, profile, roles |
| `Plan` / `PlanTable` / `PlanRow` | Workout plans with nested table structure |
| `DailyEntry` | Day-by-day check-in data (mood, sleep, weight, metrics, notes) |
| `Conversation` / `Message` | Trainer-client chat |
| `TrainerClient` | Trainer-client relationship |
| `Invitation` | Client invitation flow |
| `PushSubscription` | Web push notification subscriptions |
| `Activity` | Strava-imported or manual activities |
| `WaterEntry` | Daily hydration logs |
| `MealEntry` | Nutrition logging |
| `Reminder` | Configurable notification schedules |
| `AIConversation` / `AIMessage` | AI chat history per session |
| `WeightEntry` | Weight tracking over time |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── workout-tracker/          # Main daily workout + chat + coach
│   ├── workout-planner/          # Plan builder
│   ├── training-studio/          # Trainer portal
│   ├── training-chat/            # Client chat
│   ├── plan-progress-tracker/    # Progress analysis + PDF export
│   ├── planner/                  # Plan generator AI
│   ├── monitor/                  # Health monitor + check-in
│   ├── water-tracker/            # Hydration tracker
│   ├── my-plans/                 # Client plan list
│   ├── plan-list/                # Plan library
│   ├── reminders/                # Notification settings
│   ├── entertain/                # News, events, videos grid
│   ├── events/                   # Fitness events search
│   ├── musclemap/                # Interactive anatomy
│   ├── admin/                    # Admin panel
│   └── api/                      # All API routes
│       ├── ai/                   # AI generation endpoints
│       ├── training/             # Training Studio API
│       │   ├── clients/          # CRUD + plan assignment
│       │   ├── conversations/    # Chat messages
│       │   ├── invitations/      # Invite flow
│       │   ├── messages/         # Message deletion
│       │   └── client-conversations/  # Client-facing chat
│       ├── push/                 # Web push subscribe/unsubscribe/send
│       ├── plans/                # Plan CRUD
│       ├── entries/              # Daily entry CRUD
│       ├── water/                # Water log CRUD
│       └── ...                   # Remaining feature routes
├── components/                   # Reusable UI components
├── lib/                          # Shared utilities, hooks, types
│   ├── hooks/                    # Custom React hooks
│   ├── redux/                    # Redux store + slices
│   └── types/                    # TypeScript type definitions
├── scripts/                      # DB seeding, push SW injection, AI testing
├── public/                       # Static assets, icons, manifest, SW
└── prisma/                       # Schema + migrations
```

---

## API Overview

The backend is organized as **domain-based serverless API routes**:

| Route Group | Methods | Purpose |
|---|---|---|
| `/api/auth/*` | NextAuth | Google OAuth, sessions |
| `/api/ai/*` | POST | Plan generation, progress analysis, coach advice |
| `/api/plans/*` | GET, POST, PATCH, DELETE | Workout plans CRUD |
| `/api/training/clients/*` | GET, POST, PATCH, DELETE | Client management |
| `/api/training/conversations/*` | GET, POST | Chat messages (trainer) |
| `/api/training/client-conversations/*` | GET, POST | Chat messages (client) |
| `/api/training/invitations/*` | GET, POST, PATCH, DELETE | Invitation flow |
| `/api/training/messages/*` | DELETE | Message deletion |
| `/api/push/*` | POST, DELETE | Web push subscription management |
| `/api/entries/*` | GET, POST | Daily check-in entries |
| `/api/water/*` | GET, POST | Hydration logging |
| `/api/activities/*` | GET, POST | Strava + manual activities |
| `/api/meals/*` | GET, POST | Nutrition logging |
| `/api/reminders/*` | GET, POST, DELETE | Notification schedules |
| `/api/users/*` | GET | User profile & plans |

---

## Key Design Decisions

- **Mobile-first PWA** — all pages render inside an iPhone mockup frame (max-w-[402px]), targeting portrait mobile use as primary experience
- **Dark mode only** — consistent `#0a0a0a` background with `#FC4C02` orange accent for a premium fitness-app feel
- **Real-time over polling** — Pusher channels for chat, notifications; falling back gracefully when unavailable
- **Optimistic UI** — all mutations (chat messages, plan edits, check-ins) update the UI instantly before API confirmation
- **AI as infrastructure** — multiple specialized agents rather than a single chat interface; results are structured data, not just text
- **Trainer-first architecture** — the platform supports both individual users AND trainer-client relationships with shared plans and messaging
- **No build-time API keys** — all external services configured through runtime env vars with graceful degradation when missing

---

## Environment Variables

Required runtime configuration (all loaded via `process.env` at request time):

```
# Database
POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING

# Auth
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / NEXTAUTH_SECRET / NEXTAUTH_URL

# AI Providers
OPENAI_API_KEY / ANTHROPIC_API_KEY

# Real-time
NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER
PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET / PUSHER_CLUSTER

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_MAILTO

# YouTube & Search
YOUTUBE_API_KEY / GOOGLE_SEARCH_API_KEY / GOOGLE_SEARCH_CX

# Strava
STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET
```

---

## Development

```bash
# Install
pnpm install

# Generate Prisma client
pnpm prisma generate

# Push schema to DB
pnpm prisma db push

# Seed sample data (trainer + clients)
pnpm tsx scripts/seed-training-studio.ts

# Run dev server
pnpm dev

# Production build (generates SW with push handlers)
pnpm build

# Lint
pnpm lint
```

---

## Deployment

Deployed on **Vercel** with the following configuration:
- Framework preset: Next.js
- Build command: `prisma generate && next build && node scripts/inject-push-sw.js`
- Node version: 18+
- Postgres via Vercel Postgres (Prisma Data Proxy)
- Edge-supported SSR with static page prerendering where applicable

---

## Target Audience

- **Individual fitness enthusiasts** — plan tracking, AI coaching, progress monitoring
- **Personal trainers & coaches** — client management, plan creation, real-time messaging, progress oversight
- **Athletes** — Strava integration, structured training plans, performance analysis
- **Health-conscious users** — nutrition logging, hydration tracking, weight management

---

## Marketing Keywords

AI fitness coach | workout planner | training tracker | PWA fitness app | personal trainer app | client management | real-time chat fitness | hydration tracker | progress tracker | Strava integration | workout plan generator | AI coach app | fitness OS | trainer-client platform | Next.js fitness | muscle anatomy reference | exercise video search | dark mode fitness app
