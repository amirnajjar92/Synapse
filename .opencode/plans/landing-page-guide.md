# Synapse — Creative Landing Page Guide

A complete creative brief for building a unique, memorable landing page. Give this document to any AI platform to generate high-quality landing page code.

---

## 1. Brand Identity

**App:** Synapse — AI-Powered Fitness & Health OS
**Tagline:** Your AI Fitness Brain
**Secondary:** Plan. Track. Analyze. Adapt.
**Logo:** SynapseFit — custom animated SVG with draw/stamp effect
**Logo Component:** `<SynapseFitLogo size={180} loading={false} accentInk="#FFFFFF" />`

### Brand Personality
- **Bold** — confident, not timid
- **Technical** — modern, data-driven, intelligent
- **Premium** — feels high-end, not generic
- **Dark** — moody, cinematic, like a premium fitness brand
- **Minimal** — clean, not cluttered, every element has purpose

---

## 2. Color Palette

| Color | Hex | Where |
|---|---|---|
| **Background** | `#0a0a0a` | Main page background |
| **Background Gradient** | `linear-gradient(135deg, #0a0a0a, #1a1a1a)` | Subtle gradient overlays |
| **Orange** | `#FC4C02` | Primary accent, CTAs, active states |
| **Orange Hover** | `#e04302` | Button hover |
| **White** | `#FFFFFF` | Headings, primary text |
| **White 80%** | `rgba(255,255,255,0.8)` | Body text |
| **White 40%** | `rgba(255,255,255,0.4)` | Captions, timestamps |
| **White 10%** | `rgba(255,255,255,0.1)` | Borders, subtle dividers |
| **White 5%** | `rgba(255,255,255,0.05)` | Section dividers |
| **Surface** | `rgba(255,255,255,0.03)` | Card backgrounds |

### Glow Effects
- Orange glow: `rgba(252, 76, 2, 0.06)` — ambient hero glow
- Purple glow: `rgba(168, 85, 247, 0.04)` — secondary ambient glow
- Orange shadow: `shadow-orange-500/20` — button glow

---

## 3. Typography

**Font:** Hanalei Fill (Google Fonts), weight 400 only
**Fallback:** Arial, Helvetica, sans-serif

| Element | Size | Weight | Style |
|---|---|---|---|
| Hero Title | 48-60px | Bold 700 | White, tight line-height |
| Section Title | 24-30px | Bold 700 | White |
| Card Title | 18-20px | Semibold 600 | White |
| Body Text | 14-16px | Regular 400 | White/80 |
| Caption | 12px | Regular 400 | White/40 |
| Tag/Badge | 10-11px | Bold 700 | White/30 or Orange |
| Subtitle | 14px | Semibold 600 | Orange, uppercase, wide letter-spacing |

---

## 4. Spacing & Layout

**Max Width:** 1200px (centered)
**Mobile:** Full width with 16-32px padding
**Desktop:** Generous whitespace

| Section | Vertical Padding |
|---|---|
| Hero | min-h-screen (full viewport) |
| Feature Section | 80-96px (py-20 to py-24) |
| Tech Grid | 80-96px |
| CTA | 80-96px |
| Footer | 32px |

**Grid:** 12-column grid on desktop, single column on mobile
**Feature Layout:** Alternating left/right (screenshot left, text right, then flip)

---

## 5. Animations & Motion

### Page Load
- Logo draws in (stroke animation, ~1s)
- Text fades up with stagger (opacity 0 → 1, translateY 8px → 0)
- CTA buttons fade in after text

### Scroll-Triggered
- Sections fade in as they enter viewport (IntersectionObserver)
- Feature cards slide in from left or right
- Stats count up when visible

### Hover Effects
- Buttons: `scale(1.05)` on hover, `scale(0.95)` on active
- Cards: subtle border glow or shadow lift
- Navigation: smooth color transitions

### Continuous (Subtle)
- Hero ambient glow: slow pulse (3-4s cycle)
- Logo in loading state: continuous line draw animation
- Scroll indicator: gentle bounce

### Keyframes
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## 6. Component Patterns

### iPhone Mockup Frame
```tsx
<div className="relative" style={{ width: 280, height: 580 }}>
  <div className="absolute inset-0 rounded-[28px] border-[3px] border-zinc-700 shadow-2xl shadow-orange-500/5 overflow-hidden bg-black">
    <div className="h-7 bg-black flex items-center justify-between px-4 text-[10px] text-white/30">
      <span className="font-semibold">9:41</span>
      {/* Signal + Battery icons */}
    </div>
    <img src={src} className="w-full" style={{ height: 'calc(100% - 28px)' }} />
  </div>
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-zinc-700/50" />
</div>
```

### Primary CTA Button
```tsx
<button className="px-8 py-3.5 rounded-2xl bg-[#FC4C02] hover:bg-[#e04302] text-white font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-orange-500/20">
  Get Started Free
</button>
```

### Ghost Button
```tsx
<button className="px-8 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5 text-white/80 font-medium text-sm transition-all">
  Learn More
</button>
```

### Feature Card (Tech Grid)
```tsx
<div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-colors">
  <p className="text-white font-semibold text-sm">Label</p>
  <p className="text-zinc-500 text-[11px] mt-1">Sublabel</p>
</div>
```

### Check Mark List Item
```tsx
<li className="flex items-start gap-2.5 text-zinc-300 text-sm">
  <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  Feature description text
</li>
```

---

## 7. Page Sections (Creative Brief)

### 7a. Hero Section
**Goal:** Instantly communicate what Synapse is and make visitors want to try it.

**Layout:** Full viewport height, centered content
**Background:** Near-black (#0a0a0a) with two ambient radial glows:
- Orange glow: center-top, 600px, `rgba(252,76,2,0.06)`
- Purple glow: bottom-left, 400px, `rgba(168,85,247,0.04)`

**Content (top to bottom):**
1. SynapseFitLogo (animated, 180px, white)
2. Orange subtitle: "Plan. Track. Analyze. Adapt." (uppercase, wide letter-spacing)
3. Hero title: "Your AI Fitness Brain" (48-60px, bold, white)
4. Description: 1-2 sentences (white/60%, max-width 600px)
5. Two CTA buttons: "Get Started Free" (orange) + "See Features" (ghost)
6. Scroll indicator: bouncing chevron at bottom

**Animation:** Staggered fade-up on mount

---

### 7b. How It Works
**Goal:** Quick 3-step overview of the user journey.

**Layout:** 3-column grid on desktop, stacked on mobile

**3 cards, each with:**
1. Number badge (01, 02, 03) in orange
2. Icon (orange, 24px, in subtle orange background circle)
3. Title (white, 18px, semibold)
4. Description (white/60%, 14px)

**Steps:**
1. "Describe Your Goal" — pen/edit icon
2. "Track Your Progress" — checkmark circle icon
3. "Evolve With AI" — lightning bolt icon

---

### 7c. Features Showcase
**Goal:** Deep-dive into each major feature with visual proof.

**Layout:** Alternating left/right — screenshot on one side, text on the other.
**Background:** Alternate sections with `bg-white/[0.015]`

**6 Features:**

| # | Feature | Screenshot |
|---|---|---|
| 1 | AI Coach | `/screenshots/pages/planner.png` |
| 2 | Workout Tracker | `/screenshots/pages/workout-tracker.png` |
| 3 | Progress & Analytics | `/screenshots/pages/plan-progress-tracker.png` |
| 4 | Trainer Platform | `/screenshots/pages/training-studio-dashboard.png` |
| 5 | All-in-One Health | `/screenshots/pages/water-tracker.png` |
| 6 | PWA / Install Anywhere | `/screenshots/pages/reminders.png` |

**Each feature:** Title + Description + 3-4 bullet points + iPhone mockup frame

---

### 7d. Tech Stack
**Goal:** Show the app is built with serious, modern technology.

**Layout:** 2×4 grid on desktop, 2×2 on mobile

**8 tech badges:**
1. Next.js 16 — React / SSR / PWA
2. PostgreSQL — Prisma / Vercel
3. OpenAI + Claude — Multi-provider AI
4. Pusher — Real-time chat
5. Google OAuth — Secure sign-in
6. Strava API — Activity import
7. Web Push API — Notifications
8. Tailwind CSS — Dark mode UI

---

### 7e. Final CTA
**Layout:** Centered, max-width 600px
**Content:** "Ready to Transform Your Training?" + Get Started Free button

### 7f. Footer
**Content:** SynapseFitLogo (20px) + "Synapse — AI-Powered Fitness Tracking"

---

## 8. Unique Creative Elements

1. **Animated Logo Hero** — Stroke animation draws the logo on load
2. **Ambient Glow Background** — Two radial gradients pulse slowly
3. **iPhone Mockup Screenshots** — Realistic frames with actual app screenshots
4. **Scroll-Triggered Reveals** — Sections fade in on scroll
5. **Alternating Feature Layout** — Left/right flip prevents monotony
6. **Minimal But Bold** — Black + white + orange, whitespace does the work

---

## 9. Technical Requirements

| Requirement | Value |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **CSS** | Tailwind CSS |
| **Font** | Hanalei Fill via `next/font/google` |
| **Auth** | `signIn('google')` from `next-auth/react` |
| **Logo** | `<SynapseFitLogo />` from `@/components/SynapseFitLogo` |
| **Screenshots** | `/screenshots/pages/{name}.png` |
| **Responsive** | Mobile-first, 640px + 1024px breakpoints |
| **Dark mode only** | No light theme |
| **No API calls** | Fully static |
| **File** | `src/app/landing/page.tsx` |

---

## 10. Current State Prompt for Claude

```
# Synapse Landing Page — Current State Reference

The landing page lives at /landing (route: src/app/landing/page.tsx with its own layout at src/app/landing/layout.tsx). It is a 'use client' page in Next.js 16 App Router + Tailwind CSS.

## Design System
- Background: #0a0a0a with radial-gradient(center-top, rgba(252,76,2,0.07), transparent 55%) ambient glow
- Accent: #FC4C02 (orange)
- Text: white at 100%/80%/40%/20%/10%/5% opacity
- Font: Hanalei Fill (display) + system-ui sans (body)
- Surfaces: bg-white/[0.03] with border-white/5, rounded-2xl
- All images have a black gradient overlay: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)
- Dark mode only, premium/cinematic feel

## File Structure
```
src/app/landing/
├── layout.tsx      ← Metadata (title, description)
├── page.tsx        ← Main landing page component (self-contained, all atoms inline)

src/components/
├── ScreenshotCollage.tsx   ← 6-screenshot grid with labels + gradient overlay
├── VideoFrameCollage.tsx   ← 5-frame canvas extraction from timelapse video
├── CardioCarousel.tsx      ← Auto-cycling phone frame (6 images at 0.5s)

public/screeenshots/   ← 12 screenshots (note triple-e typo in dir name)
├── workout-tracker-1.png
├── planner-page.jpg
├── ai-planner-generating.jpg
├── sidebar-activeplans.jpg
├── water-tracker .jpg       ← note trailing space
├── events.jpg
├── cardio-monitor-1.png
├── cardio-monitor-2.jpg
├── cardio-monitor-3.jpg
├── cardio-monitor-4.jpg
├── cardio-monitor-5.jpg
├── cardio-monitor-6.jpg

public/videos/
└── compressed-Sequence 02 (1).mp4
```

## ScreenshotGallery Component (ScreenshotCollage.tsx)
- Grid: 2 cols mobile, 3 cols sm+
- Shows 6 screenshots: Workout Tracker, Planner, AI Plan Generation, Sidebar & Active Plans, Water Tracker, Events & Discovery
- Each image has a black gradient overlay (top + bottom)
- Staggered margin-top per row (i%2===0 ? 1.5rem : 0.75rem)
- Hover: scale(1.02), orange border glow, orange shadow
- Bottom label overlay with screenshot name

## CardioCarousel Component (CardioCarousel.tsx)
- Phone-sized frame: 200px wide, 9:16 aspect-ratio, rounded-[28px], black border, shadow
- Cycles through 6 cardio-monitor images (cardio-monitor-1 through 6) infinitely
- Interval: 0.5s per image
- Black gradient overlay on all images
- Dot page indicators at bottom (orange for active, white/30 for inactive)
- Title + subtitle below the phone frame

## VideoFrameCollage Component (VideoFrameCollage.tsx)
- Loads /videos/compressed-Sequence%2002%20(1).mp4 into a hidden <video>
- Uses hidden <canvas> (180×320) to seek to timestamps [0, 5, 10, 15, 20] seconds and capture frames as data URLs
- Displays 5 frame cards at 9:16 aspect-ratio, 140px wide, rounded-2xl with border
- Each frame has black gradient overlay + timestamp label (e.g. 0:00, 0:05)
- Loading spinner while extracting frames

## Page Sections (in order)
1. NAV: Logo + "Sign in" link (calls signIn() from next-auth/react)
2. HERO: SynapseFitLogo (140px), title "Your AI fitness brain.", subtitle, two CTAs (Start training free + See how it works → #screenshots)
3. SCREENSHOT GALLERY (#screenshots): Eyebrow "Gallery", section title, ScreenshotCollage grid
4. CARDIO CAROUSEL: Eyebrow "Theme Variants", title "6 colorways. One monitor.", description, CardioCarousel phone frame (left copy / right frame on desktop)
5. VIDEO TIMELAPSE: Eyebrow "Timelapse", title "Watch it all come together.", VideoFrameCollage
6. NETWORK: Eyebrow "The network", title "One plan, three nodes, always in sync.", 3 nodes (Trainer → Synapse (active) → Client) with dashed lines
7. FEATURES GRID: 6 feature cards (Progress, Activity, Hydration, Live, Nutrition, Anywhere)
8. FINAL CTA: SynapseFitLogo (90px), title "Your first plan is two minutes away.", "Get started — it's free" button
9. FOOTER: "Synapse — Plan. Track. Analyze. Adapt."

## Inline Components (defined in page.tsx)
- SynapseFitLogo: animated SVG with line draw/stamp effect, orange glow filter, montage of node+horn shapes with "Synapse" in Hanalei Fill + "FIT" in orange
- SynapseField: deterministic SVG node mesh (22 nodes, ~22 links) using orange lines at 8% opacity and pulsing circles, spans full page as fixed background
- Eyebrow: uppercase 10px bold, white/30 tracking
- PrimaryButton: black bg, orange bg (#FC4C02 → #e04302 hover), rounded-2xl, orange shadow
- GhostButton: border white/10, hover white/5 bg
- FeatureCard: glass surface, label + title + description
- NetworkNode: circle container with inner dot, active state gets orange border/glow + pulse animation

## Animations
- sf-pulse: 2.8s ease-in-out infinite, pulsing node circles
- scroll-behavior: smooth
- Logo draw-in: stroke-dasharray animation over 0.85-0.95s with stagger
- Button: active:scale-95

## Key Details
- signIn() from next-auth/react for Google OAuth
- All screenshot paths: /screeenshots/{filename} (note triple e)
- Video path: /videos/compressed-Sequence%2002%20(1).mp4
- No API calls on landing page — fully client-rendered
- SynapseField is fixed position, z-0, all other sections are relative z-10
```

---

## 11. File Structure

```
src/app/landing/
├── layout.tsx    ← Metadata (title, description)
├── page.tsx      ← Main landing page component
```

---

## 12. Common Mistakes to Avoid

1. **Generic copy** — Don't say "fitness app" — say "AI fitness brain"
2. **Flat design** — Add ambient glows, gradients, and depth
3. **Too many colors** — Stick to black + white + orange
4. **Cluttered layout** — Let whitespace breathe
5. **Missing motion** — Every premium page has subtle animations
6. **No visual proof** — Show actual app screenshots in iPhone frames
7. **Weak CTAs** — Make "Get Started Free" impossible to miss
8. **Slow load** — Use lazy loading for screenshots
9. **No mobile** — The app is mobile-first, the landing page should be too
10. **Generic footer** — Keep it minimal and on-brand
