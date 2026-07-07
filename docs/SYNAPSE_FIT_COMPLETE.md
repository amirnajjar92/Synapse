# Synapse Fit — Complete Application Reference

> **AI-Powered Fitness, Training & Lifestyle Platform**
>
> A full-stack Next.js mobile-first PWA connecting AI-driven fitness planning, real-time trainer collaboration, sport event management, and comprehensive health tracking — all delivered as a single-page installation experience.

---

## Table of Contents

1. [Vision & Product Overview](#1-vision--product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture & File Structure](#3-architecture--file-structure)
4. [All Features](#4-all-features)
5. [Database Models (Prisma)](#5-database-models-prisma)
6. [API Routes](#6-api-routes)
7. [Key Integrations & Services](#7-key-integrations--services)
8. [Authentication & User System](#8-authentication--user-system)
9. [Realtime & Notifications](#9-realtime--notifications)
10. [SEO & Discovery](#10-seo--discovery)
11. [PWA & Mobile Experience](#11-pwa--mobile-experience)
12. [SEO Engine (Standalone Python)](#12-seo-engine-standalone-python)
13. [Development & Deployment](#13-development--deployment)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Vision & Product Overview

### Mission

Make personalised AI-powered fitness coaching, structured training, and community engagement accessible to everyone — without needing a human personal trainer.

### Core Differentiators

| Capability | What It Does |
|---|---|
| **AI Plan Generator** | Natural-language prompt → structured fitness plan (meals, cardio, nutrients, supplements, challenges) |
| **Training Studio** | Full trainer dashboard with client management, real-time chat, plan assignment, event management |
| **Sport Events** | Create, share, join sport events with sponsors, maps, guest access, push/email notifications |
| **Muscle Map Anatomy** | SVG-based interactive male/female anatomy with highlight, click, front/back views |
| **AI Activity Logging** | "Ran 10km in 50 min" → structured metrics (distance, time, pace) |
| **Strava Integration** | Import real activities, track progress against AI plans |
| **PWA** | Installs like a native app, works offline, push notifications |
| **Dual-channel Notifications** | Pusher (in-app realtime) + Web Push (background) |

### Business Model (Planned)

- **Freemium** — Basic AI plans, water tracking, limited events
- **Premium** — Unlimited plans, advanced analytics, trainer chat, full event management
- **Trainer Pro** — Training Studio for professional coaches (client management, invitations, plan assignment)
- **White-label Events** — Paid event creation for organisations, sponsors and venues

---

## 2. Tech Stack

### Core Framework & Language

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 (App Router) | React framework, SSR/CSR hybrid |
| TypeScript | 5.x | Type-safe development |
| Node.js | ^20 | Runtime |

### UI & Styling

| Library | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4.1 | Utility-first CSS |
| shadcn/ui | latest | Component primitives (Button, Input, Sheet, Table, Skeleton) |
| class-variance-authority | latest | Component variants |
| clsx + tailwind-merge | latest | Class merging |
| lucide-react | latest | Icons |
| @base-ui/react | latest | UI primitives |

### State Management

| Library | Version | Purpose |
|---|---|---|
| Redux Toolkit | 2.12.0 | Global state (plan slice) |
| react-redux | 9.3.0 | React bindings |

### Database & ORM

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | latest | Database (Prisma Data Platform / Neon) |
| Prisma | 5.22.0 | ORM, migrations, type-safe queries |

### Authentication

| Library | Version | Purpose |
|---|---|---|
| NextAuth.js | 4.24.14 | Auth framework |
| @next-auth/prisma-adapter | 1.0.7 | DB adapter |
| Google OAuth 2.0 | — | Primary login |

### Realtime & Push Notifications

| Library | Version | Purpose |
|---|---|---|
| Pusher (server) | 5.3.4 | Server-side realtime triggers |
| pusher-js | 8.5.0 | Client-side realtime subscriptions |
| web-push | 3.6.7 | VAPID push notifications |
| @ducanh2912/next-pwa | 10.2.9 | PWA service worker |

### Email

| Library | Version | Purpose |
|---|---|---|
| Resend | 6.17.1 | Transactional email (free tier: 100/day) |

### Maps

| Library | Version | Purpose |
|---|---|---|
| Leaflet | 1.9.4 | Interactive maps |
| react-leaflet | 5.0.0 | React bindings |

### External APIs

| Service | Purpose | Status |
|---|---|---|
| **Moole API** | AI model endpoint | Active |
| **OpenRouter** | AI fallback (NVIDIA Nemotron) | Active |
| **Google Custom Search** | Content/event search | Via Moole proxy |
| **YouTube Search** | Video discovery | Via Moole proxy |
| **Strava API v3** | Activity sync (+ OAuth) | Code ready, client config pending |

### Other Dependencies

| Library | Purpose |
|---|---|
| Zod 4 | Schema validation |
| jsPDF 4 + jspdf-autotable | Client-side PDF export |
| Playwright | E2E screenshot capture |
| tsx | TypeScript script execution |

---

## 3. Architecture & File Structure

```
synapse/
├── .env.local                          # Environment secrets
├── auth.ts                             # NextAuth config (JWT, Google, Credentials)
├── next.config.ts                      # Next.js + PWA config
├── tailwind.config.ts                  # Tailwind configuration
├── prisma/
│   ├── schema.prisma                   # 19 models, 8 enums
│   └── migrations/                     # Database migrations
├── public/
│   ├── icons/                          # PWA icons (72–512px + maskable)
│   ├── vectors/                        # 25 SVG assets (anatomy, icons, water bottle, etc.)
│   ├── screeenshots/                   # App screenshots (for demos)
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker (push-injected at build)
├── scripts/
│   ├── inject-push-sw.js               # Injects push handlers into sw.js
│   ├── generate-icons.mjs              # PWA icon generator
│   ├── capture-screenshots.mjs         # Playwright screenshot script
│   └── seed-training-studio.ts         # Dev data seeder
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (metadata, providers, PWA components)
│   │   ├── providers.tsx               # SessionProvider wrapper
│   │   ├── loading.tsx                 # Global loading screen (SynapseFitLogo animation)
│   │   ├── page.tsx                    # Splash → redirect to /planner
│   │   ├── globals.css                 # Tailwind directives + custom animations
│   │   ├── robots.ts                   # SEO robots.txt
│   │   ├── sitemap.ts                  # XML sitemap (18 URLs)
│   │   ├── admin/                      # Admin dashboard page
│   │   ├── api/                        # 35+ API route handlers
│   │   ├── demo/                       # 9 demo pages (screenshot capture targets)
│   │   ├── [17 feature pages]          # All app pages
│   │   └── [14 per-page layout.tsx]    # SEO metadata per page
│   ├── components/
│   │   ├── ui/                         # 5 base shadcn components
│   │   ├── [56 feature components]     # Anatomy, AI, Charts, Events, etc.
│   ├── lib/
│   │   ├── db.ts / prisma.ts           # Prisma client singleton
│   │   ├── email.ts                    # Resend email templates
│   │   ├── notifications.ts            # Dual-channel notification sender
│   │   ├── pusher-server.ts            # Pusher server instance
│   │   ├── web-push.ts                 # VAPID setup
│   │   ├── strava.ts                   # Strava OAuth + sync
│   │   ├── theme.ts                    # 10 theme definitions
│   │   ├── reminderManager.ts          # Client-side reminder scheduler
│   │   ├── pdfExport.ts                # jsPDF export
│   │   └── hooks/                      # Custom hooks
│   ├── lib/redux/                      # Redux store + plan slice
│   ├── constants/muscles.ts            # Muscle group constants
│   └── types/                          # TypeScript type definitions
└── docs/                               # Documentation (40 files)
```

---

## 4. All Features

### 4.1 Home / Splash Screen (`/`)

- Animated `SynapseFitLogo` SVG drawn line by line using stroke-dashoffset
- Progress bar animation
- Auto-redirects to `/planner` after ~2.5 seconds
- Global loading state file at `src/app/loading.tsx` for route transitions

### 4.2 AI Plan Generator (`/planner`)

**The core AI experience.** Users type natural-language fitness goals and receive structured, complete plans.

- **Prompt Box**: Full-width text input sends to `/api/ai/unified`
- **AI Intent Detection**: The `/api/ai/unified` endpoint classifies intent as one of:
  - `create_plan` → generates structured plan
  - `log_activity` → logs metrics (weight, distance, etc.)
  - `analyze` → analyses progress data
  - `question` → general fitness Q&A
  - `general` → conversational response
- **Goal Weight Extraction**: AI parses goal weight from prompt (kg/lbs)
- **Plan Tables**: Generated plans contain multiple table types (MEALS, CARDIO, NUTRIENTS, SUPPLEMENTS, CHALLENGES)
- **Editing**: Inline edit tables (add/remove rows, update cells)
- **AI Modification**: Dialog-based plan modification using AI
- **Batch Table Updates**: Replace all tables at once via AI
- **Prompt History**: All prompts saved in `UserPrompt` model, viewable in admin panel
- **Plans persist** in the `Plan` → `PlanTable` → `PlanRow` hierarchy

### 4.3 Training Studio (`/training-studio`) — *Trainer Dashboard*

The most complex page (~2070 lines). Five-tab interface for trainers.

#### Tab 1: Dashboard
- **Client List**: Shows all linked clients with plan status (NONE / ACTIVE / PAUSED)
- **Add Client**: Email-based client invitation
- **Assign Plans**: Assign any plan from the repository to a client
- **Client Progress**: Visual status of plan progress per client

#### Tab 2: Builder
- **AI Plan Builder**: Create new plans with AI assistance
- **Plan Repository**: Browse existing plans by type/icon

#### Tab 3: Repository
- **Plan Catalogue**: Grid of all available plans with search/filter
- **Quick Assign**: Assign plans to clients directly

#### Tab 4: Messages
- **Real-time Chat**: Trainer-to-client messages via Pusher
- **Unread Badge**: Client count with unread messages
- **Message Deletion**: Context menu → delete with Pusher sync

#### Tab 5: Events
- **Sport Event CRUD**: Create, edit, delete events
- **Event Cards**: Title, date, location, participant count, status badges
- **Action Buttons in Footer**: Clone, edit, delete, share, manage (always visible)
- **Approval Queue**: Approve/decline pending join requests
- **Participant List**: Show approved participants
- **Manage Panel**: Expandable section with map, sponsor display, approve/decline controls

#### Trainer System (Database)
- `TrainerClient` model links trainers to clients
- `Conversation` model auto-created on client link
- `Message` model stores chat history
- `Invitation` model for email-based trainer invitations
- **Max 3 clients per trainer** (current limit)
- Plan status per client: `TrainerClient.planStatus` (NONE/ACTIVE/PAUSED)

### 4.4 Training Chat (`/training-chat`) — *Client View*

- Clients see their conversations with trainers
- Real-time messaging via Pusher (channel: `chat-{conversationId}`)
- Messages show sender, timestamp, with deletion support
- Trainer-assigned plans displayed
- Push notifications for new messages via `/api/notifications` from the API

### 4.5 Sport Events (`/sport-events/[id]`)

**Full event detail page** for shared event links.

- **Cover Image**: Large hero image with gradient overlay
- **Join Button**: Overlaid on cover image (bottom-right) — "Sign in to join" + "Join as Guest"
- **Guest Form**: Below cover image (email, phone, social link)
- **Event Details**: Title, description, date/time, location
- **Map**: Embedded Leaflet map (lat/lng)
- **Creator**: Shows who created the event
- **Hosted By**: Event host display
- **Sponsors**: Name + logo display from JSON field
- **Social Links**: Instagram, Facebook, Twitter, Website
- **Status Badges**: Active, Cancelled, Completed, Past
- **Share Button**: Copies event URL to clipboard
- **Skeleton Loading**: SynapseFitLogo animation intro
- **Notifications**: Creator gets push + email on new join request; participant gets push + email on approve/decline

### 4.6 Events Browser (`/events`)

- Browse fitness/news events via Google Custom Search (proxied through Moole API)
- Search and discover events with external links

### 4.7 Workout Planner (`/workout-planner`)

- Create structured workout plans with muscle map target selection
- Day-by-day exercise breakdown
- Sets, reps, rest periods, notes, video URLs per exercise
- Exercise ordering (drag handle support)
- **Data Model**: `WorkoutPlan` → `WorkoutDay` → `Exercise`
- Difficulty levels: BEGINNER / INTERMEDIATE / ADVANCED (enum)
- Muscle targeting via `FRONT_MUSCLES` and `BACK_MUSCLES` constants
- Muscle map shows highlighting for targeted muscles

### 4.8 Workout Tracker (`/workout-tracker`)

- Follow planned workout day-by-day
- Log actual performance (sets completed, reps, weight, duration, notes)
- Muscle map highlighting for target muscles in current session
- Trainer chat integration (message your trainer mid-workout)
- Mark days as complete
- Plan selection from active plans

### 4.9 Workout Detail (`/workout-detail/[id]`)

- Read-only detailed view of a workout plan
- Exercise listing with all sets/reps/rest
- **PDF Export**: Client-side PDF generation via jsPDF

### 4.10 Plan Detail (`/plan-detail/[id]`)

- Full plan view with all tables rendered
- Inline table editing (add/remove rows, update cells)
- **AI Modification Dialog**: Select tables → AI modifies content
- **PDF Export**: Download plan as PDF
- Status management (start, pause, complete)
- Goal weight display
- Trainer assignment info

### 4.11 Plan List (`/plan-list`)

- Browse available plan categories with icon grid
- Categories: Cardio, Meals, Nutrients, Supplements, Challenges, Recommended
- Click a plan to view details and add to your plans

### 4.12 My Plans (`/my-plans`)

- Lists all plans created by user
- Also shows plans assigned by trainers
- Delete plans (with confirmation)
- Status indicators and plan icons
- Trainer attribution for assigned plans

### 4.13 Plan Progress Tracker (`/plan-progress-tracker`)

- **Weight Chart**: Track weight over time (line chart)
- **Progress Comparison Chart**: Plan target vs actual metrics
- **Daily Entry Logging**: Log daily check-ins with notes, photos, metrics
- **AI Analysis**: Auto-analyse daily entries via `/api/ai/analyse`
- **Metrics Tracking**: Weight, calories, water, sleep, etc.
- **PDF Export**: Download progress report
- **TODOs**: Action items extracted from AI analysis

### 4.14 Monitor / Cardio Tracker (`/monitor`)

- **Activity Logging**: Log runs, walks, cycles, swims, etc.
- **Metrics**: Distance (km/mi), time, pace, weight, heart rate
- **AI-Powered**: Parse "ran 10km in 50 min" into structured metrics
- **Bar Charts**: Weight, distance, pace visualised over time
- **Plan Integration**: Compare against active plan goals
- **Strava Sync**: Fetch real activities from Strava

### 4.15 Water Tracker (`/water-tracker`)

- Daily water intake with cup-based logging (tap to add/remove)
- Configurable goal (default 12 cups/day)
- Animated water bottle fill visual
- Daily streak tracking
- Per-day data in `WaterLog` model (unique per user per date)
- Scheduled water reminders (interval-based)

### 4.16 Muscle Map Anatomy (`/musclemap`, embedded in workout pages)

- **SVG-Based**: Male and female SVG anatomies (front + back views)
- **Gender Toggle**: Switch between male/female
- **Interactive**: Click muscles to select/highlight
- **Configurable Highlights**: fillColor, fillOpacity, strokeColor, strokeWidth, blurInactive
- **Glow Effects**: SVG filter-based glow on selected muscles
- **Dual View**: Front and back toggle
- **Integrated**: Workout planner, tracker, landing page, training studio
- **Standardised Constants**: `FRONT_MUSCLES` and `BACK_MUSCLES` arrays with display names

### 4.17 Reminders (`/reminders`)

- Configure custom reminders (WATER, WORKOUT, MEAL, CUSTOM)
- Set time, repeat days, description
- Daily plan notification toggle
- Local notification scheduling via `reminderManager.ts`
- CRUD via `/api/reminders`

### 4.18 Entertain / Explore (`/entertain`)

- Content discovery page
- News, events, videos, playlists
- Google Custom Search + YouTube Search via Moole proxy
- Coach cards / influencer-style content layout
- Read more → WebViewModal in-app browser

### 4.19 Landing / Marketing Page (`/landing`)

- Premium marketing page (~1382 lines)
- Male/Female anatomy displays
- Feature showcases with phone mockup carousels
- Demo data preview
- Sign-in CTA
- Video frame collage
- Section: AI Plans, Training Studio, Nutrition, Progress Tracking, Muscles, Events

### 4.20 Admin Dashboard (`/admin`)

- User management (list, search, role assignment)
- User roles: USER / ADMIN
- Prompt history viewer (per user)
- Admin-only API protection

---

## 5. Database Models (Prisma)

### User & Auth (4 models)
| Model | Purpose |
|---|---|
| `User` | Primary user entity: email, name, image, role (USER/ADMIN) |
| `Account` | NextAuth OAuth account linking |
| `Session` | NextAuth session management |
| `VerificationToken` | NextAuth email verification |

### AI System (2 models)
| Model | Purpose |
|---|---|
| `AIConversation` | Chat sessions per user with sessionId |
| `AIMessage` | Messages: role (user/assistant/system), content, intent, confidence, contextPage, metadata |

### Plans & Tracking (6 models)
| Model | Purpose |
|---|---|
| `Plan` | title, prompt, icon, status (enum), goalWeight, goalUnit, date range, creator + assigned trainer |
| `PlanTable` | Tables within plan (MEALS, CARDIO, NUTRIENTS, SUPPLEMENTS, CHALLENGES) |
| `PlanRow` | Row values (columns JSON array), ordering |
| `DailyEntry` | Per-day check-in: notes, aiAnalysis, todos, linked to plan + user |
| `DailyMetric` | type, value, unit — e.g. weight: 75, unit: kg |
| `DailyMedia` | type (image/video/audio/document), url |
| `UserPrompt` | Historical prompts: content, response, planId, page |

### Workout (4 models)
| Model | Purpose |
|---|---|
| `WorkoutPlan` | title, description, goal, difficulty (enum), days, weeks, schedule |
| `WorkoutDay` | dayNumber, restDay, within a workout plan |
| `Exercise` | name, sets, reps, rest, targetMuscles (JSON), instructions, videoUrl |
| `ExerciseLog` | Logged performance: sets, reps, weight, duration, notes |

### Training Studio (4 models)
| Model | Purpose |
|---|---|
| `TrainerClient` | Links trainer → client with planStatus (enum) |
| `Conversation` | Trainer-client chat conversation |
| `Message` | Chat messages with sender, content, read status |
| `Invitation` | Trainer invitations with status (enum PENDING/ACCEPTED/DECLINED) |

### Sport Events (2 models)
| Model | Purpose |
|---|---|
| `SportEvent` | title, description, date, location (lat/lng), maxParticipants, hostedBy, coverImage, sponsors (JSON), social links, status (enum) |
| `EventEngagement` | Links user or guest to event: status (enum PENDING/APPROVED/DECLINED), guestEmail, guestPhone, guestLinks |

### Tracking (4 models)
| Model | Purpose |
|---|---|
| `WaterLog` | cups, goalCups (unique per user+date) |
| `Activity` | Strava-synced: type, name, distance, time, heart rate, speed, calories, polyline |
| `Reminder` | time, days (JSON), type (enum), description, enabled |
| `PushSubscription` | Web push: email, endpoint (unique), p256dh, auth |

### Enums
| Enum | Values |
|---|---|
| `PlanStatus` | NOT_STARTED, IN_PROGRESS, PAUSED, COMPLETED |
| `ClientPlanStatus` | NONE, ACTIVE, PAUSED |
| `UserRole` | USER, ADMIN |
| `ReminderType` | WATER, WORKOUT, MEAL, CUSTOM |
| `EventStatus` | ACTIVE, CANCELLED, COMPLETED |
| `EngagementStatus` | PENDING, APPROVED, DECLINED |
| `InvitationStatus` | PENDING, ACCEPTED, DECLINED |
| `Difficulty` | BEGINNER, INTERMEDIATE, ADVANCED |

---

## 6. API Routes

### AI & Conversations
| Route | Method | Purpose |
|---|---|---|
| `/api/ai/unified` | POST | Unified AI with intent detection |
| `/api/ai/analyse` | POST | AI analysis via Moole/OpenRouter |
| `/api/ai/conversations` | GET/POST/DELETE | AI chat history CRUD |

### Auth
| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |

### Plans
| Route | Method | Purpose |
|---|---|---|
| `/api/plans` | GET/POST | List plans, create plan |
| `/api/plans/[id]` | GET/PUT/DELETE/PATCH | CRUD + cell/row/table batch updates |

### Sport Events
| Route | Method | Purpose |
|---|---|---|
| `/api/sport-events` | GET/POST | List (by creator, upcoming filter), create |
| `/api/sport-events/[id]` | GET/PUT/DELETE | Event CRUD |
| `/api/sport-events/[id]/engage` | POST/PUT/DELETE | Join/approve/decline/leave (push + email) |
| `/api/sport-events/pending-count` | GET | Pending request count for sidebar badge |

### Training Studio
| Route | Method | Purpose |
|---|---|---|
| `/api/training/clients` | GET/POST | List/add trainer clients |
| `/api/training/clients/[id]` | PATCH/DELETE | Update status, remove |
| `/api/training/invitations` | GET/POST | List/send invitations |
| `/api/training/invitations/[id]` | PATCH/DELETE | Accept/decline/cancel |
| `/api/training/conversations/[clientId]` | GET/POST | Trainer messages + send |
| `/api/training/client-conversations` | GET/POST | Client messages + send |
| `/api/training/messages/[messageId]` | DELETE | Delete message (Pusher sync) |

### Push Notifications
| Route | Method | Purpose |
|---|---|---|
| `/api/push/subscribe` | POST | Register subscription |
| `/api/push/unsubscribe` | DELETE | Remove subscription |
| `/api/push/send` | POST | Send push to user |

### Reminders
| Route | Method | Purpose |
|---|---|---|
| `/api/reminders` | GET/POST/PATCH/DELETE | Reminder CRUD |

### Users
| Route | Method | Purpose |
|---|---|---|
| `/api/users/info` | GET/POST | User info CRUD |
| `/api/users/me/plans` | POST | List user's plans + assigned plans |
| `/api/users/me/water` | GET/POST | Water intake by date |
| `/api/users/me/daily-entries` | GET/POST | Daily entries CRUD |
| `/api/users/me/daily-entries/[date]` | GET/DELETE | Single entry |
| `/api/users/me/daily-entries/[date]/analyze` | POST | AI analyse entry |

### Admin
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/[userId]` | PUT | Update role |
| `/api/admin/users/[userId]/prompts` | GET | Prompt history |

### Search
| Route | Method | Purpose |
|---|---|---|
| `/api/search/google` | POST | Google Custom Search via Moole |
| `/api/search/youtube` | POST | YouTube Search via Moole |

### Strava
| Route | Method | Purpose |
|---|---|---|
| `/api/strava/status` | GET | Check connection status |
| `/api/strava/sync` | GET | Sync activities |

### Other
| Route | Method | Purpose |
|---|---|---|
| `/api/prompts` | POST | Save user prompt |
| `/api/landing/preview` | GET | Demo data for landing |

---

## 7. Key Integrations & Services

### 7.1 Pusher (Realtime Messaging)

**Purpose**: Deliver chat messages and notifications instantly while the app is open.

```
Client A → POST /api/training/conversations/[id] → API saves Message
                                                    ↓
                                            pusher.trigger('chat-{conversationId}', 'new-message', msg)
                                                    ↓
                                            Client B receives on Pusher channel → renders in realtime
```

| Detail | Value |
|---|---|
| App ID | `2171877` |
| Key | `d700269a49adfc891168` |
| Cluster | `eu` |
| Channel pattern | `chat-{conversationId}`, `notifications-{email}` |
| Events | `new-message`, `message-deleted`, `notification` |

### 7.2 Web Push (VAPID / Background Notifications)

**Purpose**: Deliver push notifications when the app is closed or backgrounded.

| Detail | Value |
|---|---|
| Public Key | `BLVA7-_KehBOGKFr7kMR993I5XqTvYfVUJxidYML-...` |
| Subject | `mailto:trainer@synapse.app` |
| Service Worker | Push event handler injected at build time via `scripts/inject-push-sw.js` |
| Subscription Store | `PushSubscription` model in PostgreSQL |
| Cleanup | Expired subscriptions (410 Gone) auto-removed |

### 7.3 Resend (Email)

**Purpose**: Transactional emails for event engagement workflow.

| Detail | Value |
|---|---|
| API Key | `re_TRUZkvTS_M49yfRPrUzHF2B8oLGD5bdf1` (in .env.local) |
| From | `onboarding@resend.dev` (development) |
| Free tier | 100 emails/day |
| Templates | `joinRequestEmail()` — creator notification; `approvalEmail()` — participant notification |
| Use cases | Join request to creator, approval/decline to participant |

### 7.4 Strava (Activity Sync)

**Purpose**: Import real-world fitness activities for tracking.

| Detail | Value |
|---|---|
| Auth | OAuth 2.0 (ready in `auth.ts`, commented out) |
| Client config | Needs `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` |
| Token refresh | Auto-refresh via `lib/strava.ts` |
| Data synced | Type, name, distance, time, speed, heart rate, calories, map polyline |
| API routes | `/api/strava/status`, `/api/strava/sync` |

### 7.5 Google OAuth (Authentication)

| Detail | Value |
|---|---|
| Client ID | `763002332533-9fk3gd611c2etmdfdmu3bhlu7u7uosaj.apps.googleusercontent.com` |
| Strategy | JWT-based sessions |

### 7.6 Leaflet (Maps)

| Detail | Value |
|---|---|
| Data | OpenStreetMap tiles |
| Components | `MapDisplay` (read-only, no drag), `LocationPicker` (interactive with search) |
| Use cases | Event detail maps, event creation location picker |

### 7.7 Moole AI (AI Backend)

| Detail | Value |
|---|---|
| Endpoint | `https://moole-back.vercel.app/ask-moole` |
| Fallback | `https://moole-back.vercel.app/ask-openrouter` (NVIDIA Nemotron) |
| Also proxies | Google Search, YouTube Search |
| Timeout | 15 seconds |

---

## 8. Authentication & User System

### Flow
1. User visits any protected page
2. `SessionProvider` in `providers.tsx` checks NextAuth session
3. If no session → redirect to `/` (splash + sign-in)
4. Google OAuth popup → `/api/auth/callback/google` → Prisma adapter creates/links `User`, `Account` records
5. Post-login → stored in localStorage for non-NextAuth fallback (`synapse_user`)
6. `localStorage` also stores JWT fallback token (`synapse_token`)

### User Roles
- `USER` — Default role for all signed-in users
- `ADMIN` — Access to admin panel (user management, prompt history)

### Local-First Approach
- `localStorage.getItem('synapse_user')` checked every 500ms in Sidebar
- Allows app to work even without NextAuth re-renders
- Falls back to email-based user lookup when session not available

---

## 9. Realtime & Notifications

### Dual-Channel Architecture

```
Server (lib/notifications.ts)
  ├── Pusher ──► Client open (PusherNotificationListener.tsx)
  │                └── In-app toast + showNotification() via SW
  └── Web Push ──► Service Worker (sw.js)
                     └── System notification (background)
```

### What Triggers Notifications

| Action | Recipient | Channel |
|---|---|---|
| New chat message | Recipient (trainer/client) | Pusher + Web Push |
| Event join request | Event creator | Pusher + Web Push + Email |
| Event approval/decline | Participant (user or guest) | Pusher + Web Push + Email |
| Training invitation | Invited user | Pusher + Web Push |
| Daily plan reminder | Self | Local Notification |

### Service Worker (sw.js)
- Generated by `@ducanh2912/next-pwa`
- Push handler injected at build via `scripts/inject-push-sw.js`
- `notificationclick` event → focuses/opens app window
- Offline caching via Workbox

---

## 10. SEO & Discovery

### Robots.txt
- Generated via `src/app/robots.ts`
- Allows `*` on all public pages
- Disallows: `/api/*`, `/admin/*`, `/demo/*`, `/logotest/*`, `/test-anatomy/*`

### Sitemap
- Generated via `src/app/sitemap.ts`
- 18 URLs with priorities (1.0 → 0.4)
- Change frequencies: monthly (most), weekly (planner, workouts)
- Top priority: `/` (1.0), `/landing` (0.9)

### Metadata
- Template: `%s | Synapse Fit`
- Default title: `Synapse — AI Fitness & Health Tracker`
- Open Graph + Twitter Card for all pages
- `metadataBase: 'https://synapse-fit.vercel.app'`
- Per-page layout.tsx files with title, description, OG, canonical

### 10.1 SEO Engine (Standalone Python Project)

A **separate LangChain-based Python project** at `synapse-seo-engine/` (gitignored) that provides:

- **Crawler**: Parses local `sitemap.ts` to extract URLs + fetches live pages via httpx + BeautifulSoup
- **Auditor**: 10-point SEO checks per page:
  1. Title length (30–60 chars)
  2. Meta description length (70–160 chars)
  3. Meta description exists
  4. OG title
  5. OG description
  6. OG image
  7. OG url
  8. Canonical URL
  9. H1 tag count
  10. JSON-LD structured data
- **Fixer**: LangChain chain (`ChatPromptTemplate | LLM | StrOutputParser`) generates JSON fixes via AI
- **CLI**: `uv run python -m seo_engine.main audit|fix|pages`
- **LLM**: Custom `MooleLLM` (LangChain `BaseChatModel`) wrapping the moole/openrouter APIs with retry logic
- **Results**: 16 pages audited → 111 issues found; 16 fixes generated across 4 pages
- **Future**: Auto-create GitHub PRs from generated fixes (Phase 3)

---

## 11. PWA & Mobile Experience

### PWA Features
- **Installable**: `beforeinstallprompt` event captured by `PWAInstallButton`
- **Offline**: Workbox service worker caches assets
- **Push**: Standard Web Push API with VAPID keys
- **Manifest**: Icons from 72px to 512px (including maskable), background color, theme color
- **iOS**: apple-touch-icon, apple-mobile-web-app-capable meta tags
- **Splash screen**: Custom animated loading screen

### Performance
- Mobile-first responsive design (Tailwind breakpoints)
- Navigation loading state via `NavigationLoadingProvider`
- Skeleton loading screens on data-fetching pages
- `loading.tsx` for route-level loading states

---

## 12. SEO Engine (Standalone Python)

**Location**: `synapse-seo-engine/` (separate directory, not in git)

**Purpose**: Automated SEO auditing and fix generation using LangChain.

**Components**:
- `seo_engine/llm.py` — Custom `MooleLLM` (BaseChatModel) wrapping moole/openrouter APIs
- `seo_engine/crawler.py` — Sitemap fetcher + local `sitemap.ts` parser
- `seo_engine/auditor.py` — 10-point SEO audit rule engine
- `seo_engine/fixer.py` — LangChain chain: `prompt | LLM | parser` with JSON extraction
- `seo_engine/main.py` — CLI entrypoint

**Results**: 16 pages → 111 issues; automated fixes generated.

**Next Phase**: Auto-create GitHub PRs from fixes.

---

## 13. Development & Deployment

### Environment Variables
```
# Database
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Auth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Pusher
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=eu

# Web Push / VAPID
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_MAILTO=mailto:trainer@synapse.app

# Email
RESEND_API_KEY=...
EMAIL_FROM=onboarding@resend.dev

# App
NEXT_PUBLIC_APP_URL=https://synapse-fit.vercel.app
```

### Scripts (package.json)
| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + Next build + inject push SW |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run postinstall` | Prisma generate |

### Vercel Deployment
- Hosted at: `https://synapse-fit.vercel.app`
- `vercel.json` configuration in place
- Framework preset: `vercel`
- Build command: `npm run build`

### Demo Pages (Screenshot Capture)
9 demo routes at `/demo/*` replicate main pages with mock data for:
- Programmatic screenshot generation via Playwright (`scripts/capture-screenshots.mjs`)
- Marketing materials and app store assets

---

## 14. Future Roadmap

### Phase 1 (Current) — Core Platform
- [x] AI plan generation
- [x] Workout planner & tracker
- [x] Water tracker & reminders
- [x] Muscle map anatomy
- [x] Training Studio (trainer dashboard)
- [x] Real-time chat with Pusher
- [x] Push notifications (VAPID + Web Push)
- [x] Sport events with engagement system
- [x] Email notifications (Resend)
- [x] PWA installation
- [x] Strava integration (code ready)
- [x] SEO engine (standalone Python)

### Phase 2 — Growth
- [ ] Premium subscription tiers (Stripe)
- [ ] AI video exercise library
- [ ] Social feed (post workouts, achievements)
- [ ] In-app purchases (meal plans, challenges)
- [ ] Apple Health / Google Fit sync
- [ ] Group challenges & leaderboards
- [ ] Trainer marketplace
- [ ] SEO engine auto-PR GitHub integration

### Phase 3 — Scale
- [ ] Mobile native apps (React Native)
- [ ] AI nutrition tracking (photo recognition)
- [ ] Wearable device integration (Apple Watch, Garmin)
- [ ] Multi-language support
- [ ] Enterprise / gym chain licensing
- [ ] Real-time workout sync (group classes)
- [ ] AI form correction (video analysis)

---

*Document generated from codebase analysis. For technical questions, reference the specific file paths listed throughout this document.*
