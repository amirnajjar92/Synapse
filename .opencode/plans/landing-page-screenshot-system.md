# Landing Page + Screenshot System — Implementation Plan

## Overview

Two main deliverables:
1. **Screenshot mode** — a `?screenshot=true` URL param system that renders every app page with mock data, no auth, no chrome — ready for PNG capture
2. **Landing page** at `/landing` — a full-screen dark marketing page showcasing all features using captured PNGs inside iPhone mockup frames

---

## Step 1: Screenshot Data

**File:** `src/lib/screenshot-data.ts`

Export all hardcoded mock data:

- `MOCK_USER` — `{ email: 'demo@synapse.app', name: 'Alex Chen', picture: null }`
- `MOCK_PLAN` — Full Push/Pull/Legs 7-day plan with exercises, sets/reps, durations
- `MOCK_WATER_ENTRIES` — 7 days of water glass counts (4–9 glasses/day)
- `MOCK_WATER_GOAL` — 8 glasses
- `MOCK_CLIENTS` — 3 clients (Sarah Johnson active w/ plan, Mike Torres active w/o plan, Emily Park pending)
- `MOCK_MESSAGES_BY_CLIENT` — Chat threads for Sarah (4 messages) and Mike (3 messages)
- `MOCK_DAILY_ENTRIES` — 4 days of check-in data (mood, sleep, weight, notes, metrics)
- `SCREENSHOT_PAGES` — Array of `{ path, label, desc }` for all 14 capture targets

---

## Step 2: ScreenshotProvider Component

**File:** `src/components/ScreenshotProvider.tsx`

A client component that:
1. Checks `window.location.search` for `?screenshot=true` (or `?show=true`)
2. If active:
   - Seeds `localStorage.setItem('synapse_user', JSON.stringify(MOCK_USER))` so all pages auto-detect a logged-in user
   - Adds CSS class `screenshot-mode` to `<html>` or a wrapper `<div>`
   - Stores a flag in React context so child pages can detect it
3. Renders children + injects a global `<style>` block:
   ```css
   .screenshot-mode .floating-nav-bar,
   .screenshot-mode .burger-menu-button,
   .screenshot-mode .pwa-install-button,
   .screenshot-mode .sidebar-backdrop,
   .screenshot-mode .sidebar-panel { display: none !important; }
   .screenshot-mode .main-content { padding-top: 0 !important; }
   ```
4. Exports a `useScreenshotMode()` hook returning `{ isScreenshotMode: boolean }`

All pages that use BurgerMenuButton, FloatingNavBar will already read this class and hide.

---

## Step 3: Update Root Layout

**File:** `src/app/layout.tsx`

- Import `ScreenshotProvider`
- Wrap `{children}` with `<ScreenshotProvider>`
- No other changes needed (all hiding done via CSS)

---

## Step 4: Update Each Major Page for Screenshot Mode

Each page needs to skip API calls and use mock data when in screenshot mode.

### 4a. Workout Tracker (`src/app/workout-tracker/page.tsx`)

**When screenshot mode:**
- Set `isLoggedIn = true` immediately (skip auth check)
- Set `userEmailRef.current = 'demo@synapse.app'`
- Set `planData = MOCK_PLAN.tables[0].rows` (skip fetch)
- Select day 0 by default
- Set muscle map gender to `'male'`, view to `'front'`
- Set `showTrainerChat = false` by default (or true for a chat-focused screenshot)
- For trainer conversations, use mock data:
  ```ts
  setTrainerConvs([{
    trainer: { id: 'trainer-1', name: 'Coach Alex', email: 'alex@synapse.app' },
    conversationId: 'conv-1',
    messages: MOCK_MESSAGES_BY_CLIENT['client-1']
  }])
  ```

### 4b. Training Studio (`src/app/training-studio/page.tsx`)

**When screenshot mode:**
- Set `userEmail = 'demo@synapse.app'`
- Set `isSignedIn = true`
- Pre-populate `activeClients = MOCK_CLIENTS`
- Populate `chatMessages` based on selected client
- If `?tab=dashboard` → show dashboard tab
- If `?tab=messages` → show messages tab with client-1 selected

### 4c. Water Tracker (`src/app/water-tracker/page.tsx`)

**When screenshot mode:**
- Pre-populate water entries from `MOCK_WATER_ENTRIES`
- Set user's email to mock
- Set goal to `MOCK_WATER_GOAL`
- Today's progress shows 4/8 glasses (partially filled)

### 4d. Other Pages

For the remaining pages (planner, my-plans, plan-progress-tracker, monitor, reminders, entertain, events, training-chat, musclemap, plan-list):

- **Minimum viable approach:** These pages will simply show their UI shell with the `screenshot-mode` CSS hiding chrome and the mock user seeded in localStorage. If they fetch from API, the calls will fail silently and show empty/fallback states. For a screenshot tool, this is acceptable for an MVP. We can iterate later.

**Higher-effort pages that would benefit from data:**
- `my-plans` — show the mock plan
- `plan-progress-tracker` — show mock entries
- `monitor` — show mock weight/health data

These can be enhanced in a follow-up iteration.

---

## Step 5: Screenshot Capture Script

**File:** `scripts/capture-screenshots.mjs`

A Node.js ESM script using Playwright:

```js
import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const PAGES = [
  { path: '/workout-tracker?show=true', name: 'workout-tracker' },
  { path: '/planner?show=true', name: 'planner' },
  { path: '/water-tracker?show=true', name: 'water-tracker' },
  { path: '/my-plans?show=true', name: 'my-plans' },
  { path: '/training-studio?tab=dashboard&show=true', name: 'training-studio-dashboard' },
  { path: '/training-studio?tab=messages&show=true', name: 'training-studio-messages' },
  { path: '/plan-progress-tracker?show=true', name: 'plan-progress-tracker' },
  { path: '/monitor?show=true', name: 'monitor' },
  { path: '/reminders?show=true', name: 'reminders' },
  { path: '/entertain?show=true', name: 'entertain' },
  { path: '/events?show=true', name: 'events' },
  { path: '/training-chat?show=true', name: 'training-chat' },
  { path: '/musclemap?show=true', name: 'musclemap' },
  { path: '/plan-list?show=true', name: 'plan-list' },
];

const OUT_DIR = path.resolve('public/screenshots/pages');
const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 402, height: 874 };

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Build + start server
  execSync('npm run build', { stdio: 'inherit' });
  const server = spawn('npm', ['start'], { stdio: 'pipe', env: { ...process.env, PORT: '3000' } });
  await new Promise(r => setTimeout(r, 5000));

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    const tab = await context.newPage();
    try {
      await tab.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await tab.waitForTimeout(1000);
      await tab.screenshot({ path: path.join(OUT_DIR, `${page.name}.png`), fullPage: true });
      console.log(`✓ captured ${page.name}.png`);
    } catch (e) {
      console.error(`✗ failed ${page.name}:`, e.message);
    }
    await tab.close();
  }

  await browser.close();
  server.kill();
  console.log('Done — all screenshots in', OUT_DIR);
}

main().catch(console.error);
```

**package.json addition:**
```json
"scripts": {
  "screenshots:capture": "node scripts/capture-screenshots.mjs"
}
```

**Dependency:** `npm install -D playwright` + `npx playwright install chromium`

---

## Step 6: Landing Page

**File:** `src/app/landing/page.tsx`

A fully static (no auth, no API) page with these sections:

### Imports needed:
- `SynapseFitLogo` from `@/components/SynapseFitLogo`
- `signIn` from `next-auth/react`
- `useRouter` from `next/navigation`
- Screenshot images imported statically or referenced from `/screenshots/pages/`

### Sections:

**1. Hero** — Full-viewport dark section:
- Ambient radial glow centered
- SynapseFitLogo (size ~200, `accentInk="#FFFFFF"`, `loading={false}` after mount)
- "Your AI Fitness Brain" tagline in uppercase, letter-spaced
- Subtitle: "Plan. Track. Analyze. Adapt — with an AI coach that knows your body."
- "Get Started Free" CTA button (orange `bg-[#FC4C02]`) → calls `signIn('google')`
- Google Sign-In button below (secondary)
- Smooth fade-in on mount

**2. How It Works** — 3-step row:
1. **Describe your goal** — "Lose 10kg" or "Build muscle in 8 weeks" → AI generates a plan
2. **Track daily** — Day-by-day exercises, check-ins, water logging
3. **Get coached** — Real-time AI advice, trainer messaging, progress analysis

Each step has an icon (SVG), title, description, and a subtle animated border.

**3. AI Coach** — Full-width section:
- Left: iPhone mockup frame with the planner page screenshot
- Right: feature highlights (natural language → structured plan, AI modifies existing plans, progress analysis)
- "Generate your first plan in seconds" CTA

**4. Workout Tracker** — Alternating layout:
- Right: screenshot mockup
- Left: feature bullets (day navigation, exercise checkboxes, anatomy muscle maps, coach tips)
- "Track every rep" heading

**5. Progress & Analytics**:
- Screenshot of progress tracker + monitor
- Bullets: daily check-in, weight trends, AI analysis, PDF reports

**6. Training Studio**:
- Screenshot of training studio (messages tab)
- Bullets: client management, real-time chat, plan assignment, push notifications

**7. All-in-One Health**:
- Grid of 4 feature cards (water tracker, nutrition, Strava activities, reminders)
- Each card has a small icon + description

**8. PWA Features**:
- Install on home screen, push notifications, offline mode
- Badges/icons grid

**9. Final CTA** — Centered:
- "Ready to transform your training?"
- Google Sign-In button (large)

### Design notes:
- Full page, no iPhone mockup frame (it IS the marketing page)
- Max-width: 1200px centered for desktop, full-width on mobile
- Each feature section has `py-20` padding and subtle section dividers (1px border-white/5)
- Screenshot frames use CSS iPhone mockup: rounded corners (`rounded-[32px]`), black border, status bar simulation, shadow glow
- All animations via CSS `animate-fadeIn` / intersection observer for scroll-triggered reveals
- No API calls, no localStorage access, fully static

### iPhone Mockup Frame CSS:
```tsx
<div className="relative" style={{ width: 320, height: 680 }}>
  {/* Outer bezel */}
  <div className="absolute inset-0 rounded-[32px] border-[3px] border-zinc-700 shadow-2xl overflow-hidden bg-black">
    {/* Status bar */}
    <div className="h-6 bg-black flex items-center justify-between px-4 text-[10px] text-white/40">
      <span>9:41</span>
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full border border-white/30" />
        <div className="w-3 h-3 rounded-full border border-white/30" />
      </div>
    </div>
    {/* Screenshot image */}
    <img src={src} alt={alt} className="w-full" style={{ height: 'calc(100% - 24px)' }} />
  </div>
  {/* Home indicator */}
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-zinc-600" />
</div>
```

---

## Files Summary

| # | Action | File |
|---|--------|------|
| 1 | Create | `src/lib/screenshot-data.ts` |
| 2 | Create | `src/components/ScreenshotProvider.tsx` |
| 3 | Edit | `src/app/layout.tsx` — wrap with ScreenshotProvider |
| 4 | Edit | `src/app/workout-tracker/page.tsx` — add screenshot mode |
| 5 | Edit | `src/app/training-studio/page.tsx` — add screenshot mode |
| 6 | Edit | `src/app/water-tracker/page.tsx` — add screenshot mode |
| 7 | Create | `scripts/capture-screenshots.mjs` |
| 8 | Edit | `package.json` — add screenshots:capture script |
| 9 | Create | `src/app/landing/page.tsx` |
| 10 | Run | `pnpm screenshots:capture` to generate PNGs |
| 11 | Edit | Landing page imports PNGs after capture |

---

## Implementation Order

1. Screenshot data (pure data, zero risk)
2. ScreenshotProvider + layout (isolated component)
3. workout-tracker screenshot mode (most complex page, sets the pattern)
4. training-studio screenshot mode
5. water-tracker screenshot mode
6. Remaining pages (minimal — just CSS hiding from screenshot class)
7. Capture script
8. Landing page (uses captured images)
9. Build + capture + verify

---

## After First Iteration

- Improve mock data for remaining pages (planner, my-plans, progress, monitor)
- Add screenshot mode to those pages too
- Tweak landing page copy/screenshots based on real capture results
- Add GIF generation (multiple screenshots per page → ffmpeg)
- Deploy landing page alongside app
