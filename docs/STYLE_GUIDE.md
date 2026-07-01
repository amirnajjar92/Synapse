# Synapse — Style Guide

A reference document for AI systems and developers to understand the app's visual language, design tokens, component patterns, and UI conventions.

---

## Brand Identity

| Attribute | Value |
|---|---|
| **App Name** | Synapse |
| **Tagline** | Your AI Fitness Brain |
| **Secondary Tagline** | Plan. Track. Analyze. Adapt. |
| **Logo** | SynapseFit — custom SVG with animated draw/stamp effect |
| **Logo Color** | White (`#FFFFFF`) on dark backgrounds, Black (`#000000`) on light |
| **Logo Component** | `<SynapseFitLogo size={280} loading={true} accentInk="#FFFFFF" />` |

---

## Color System

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| **Primary Orange** | `#FC4C02` | Primary action buttons, active states, links, accents |
| **Primary Hover** | `#e04302` | Hover state for primary buttons |
| **Background** | `#0a0a0a` | Main app background (near-black) |
| **Background Light** | `#1a1a1a` | Subtle gradient overlay, card backgrounds |
| **Surface** | `rgba(255, 255, 255, 0.05)` | Cards, panels, input backgrounds |
| **Surface Hover** | `rgba(255, 255, 255, 0.1)` | Hover states on surface elements |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| **Text Primary** | `#FFFFFF` | Headings, primary content |
| **Text Secondary** | `rgba(255, 255, 255, 0.8)` | Body text, descriptions |
| **Text Tertiary** | `rgba(255, 255, 255, 0.4)` | Timestamps, captions, hints |
| **Text Disabled** | `rgba(255, 255, 255, 0.2)` | Disabled text, subtle labels |

### Border Colors

| Token | Hex | Usage |
|---|---|---|
| **Border Subtle** | `rgba(255, 255, 255, 0.05)` | Section dividers, card borders |
| **Border Default** | `rgba(255, 255, 255, 0.1)` | Input borders, card borders |
| **Border Focus** | `rgba(255, 255, 255, 0.2)` | Focused input borders |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| **Success** | `#22C55E` | Completed states, success messages |
| **Warning** | `#EAB308` | Caution states, warnings |
| **Error** | `#EF4444` | Error states, delete actions, destructive |
| **Info** | `#3B82F6` | Information, links |

### Chat Colors

| Token | Hex | Usage |
|---|---|---|
| **Own Message** | `#FC4C02` | User's sent messages (orange bubble) |
| **Other Message** | `rgba(255, 255, 255, 0.1)` | Received messages (semi-transparent) |

---

## Typography

### Font

- **Primary:** Hanalei Fill (Google Fonts) — loaded via `next/font/google`
- **Fallback:** Arial, Helvetica, sans-serif
- **CSS Variable:** `--font-hanalei-fill`
- **Weight:** 400 only

### Type Scale

| Element | Size | Weight | Color | Line Height |
|---|---|---|---|---|
| **Page Title** | 24px / 1.5rem | Bold (700) | White | 1.2 |
| **Section Title** | 18px / 1.125rem | Semibold (600) | White | 1.3 |
| **Card Title** | 14px / 0.875rem | Medium (500) | White | 1.4 |
| **Body** | 14px / 0.875rem | Regular (400) | White/80 | 1.5 |
| **Caption** | 12px / 0.75rem | Regular (400) | White/40 | 1.4 |
| **Badge/Tag** | 10px / 0.625rem | Bold (700) | White/30 | 1.0 |
| **Timestamp** | 9px | Regular (400) | White/30 | 1.0 |

---

## Spacing

Base unit: **4px** (Tailwind default)

| Token | Value | Usage |
|---|---|---|
| **xs** | 4px | Tight spacing (icon gaps) |
| **sm** | 8px | Compact spacing (inline elements) |
| **md** | 12px | Default spacing (card padding, gaps) |
| **lg** | 16px | Comfortable spacing (section gaps) |
| **xl** | 24px | Section spacing |
| **2xl** | 32px | Major section spacing |
| **3xl** | 48px | Hero section padding |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| **sm** | 8px | Buttons, small cards |
| **md** | 12px | Input fields, medium cards |
| **lg** | 16px | Large cards, modals |
| **xl** | 24px | Chat bubbles, feature cards |
| **2xl** | 32px | iPhone mockup frame, large containers |
| **full** | 9999px | Pills, badges, circular buttons |

---

## Shadows & Effects

### Shadows

| Token | CSS | Usage |
|---|---|---|
| **Subtle** | `0 0 0 1px rgba(255,255,255,0.05)` | iPhone frame outer glow |
| **Card** | `0 4px 20px rgba(0,0,0,0.3)` | Card elevation |
| **Modal** | `0 8px 40px rgba(0,0,0,0.5)` | Modal/dialog elevation |
| **Orange Glow** | `0 4px 20px rgba(252,76,2,0.2)` | Primary button glow |

### Blur Effects

| Token | CSS | Usage |
|---|---|---|
| **Backdrop** | `backdrop-filter: blur(20px)` | Glass morphism panels |
| **Button Glow** | `filter: blur(10px)` | Button glow effects |

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="px-8 py-3.5 rounded-2xl bg-[#FC4C02] hover:bg-[#e04302] text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20">
  Get Started
</button>
```

#### Secondary Button (Ghost)
```tsx
<button className="px-8 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5 text-white/80 font-medium text-sm transition-all">
  Learn More
</button>
```

#### Icon Button (Circular)
```tsx
<button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
  <Icon />
</button>
```

#### Danger Button
```tsx
<button className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
    {/* trash icon */}
  </svg>
</button>
```

### Input Fields

```tsx
<input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/20" />
```

### Cards

```tsx
<div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
  <p className="text-white font-semibold text-sm">Title</p>
  <p className="text-zinc-500 text-[11px] mt-1">Description</p>
</div>
```

### Chat Bubbles

#### Own Message
```tsx
<div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs bg-[#FC4C02] text-white rounded-tr-none">
  {message}
</div>
```

#### Received Message
```tsx
<div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs bg-white/10 text-white rounded-tl-none">
  {message}
</div>
```

### Timestamps
```tsx
<span className="text-[9px] text-white/30 mt-0.5 px-1">
  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
</span>
```

### Pills / Tabs

```tsx
<button className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'bg-[#FC4C02] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
  Tab Label
</button>
```

### Badges

```tsx
<span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-[#FC4C02] text-white text-[8px] font-bold flex items-center justify-center leading-none">
  {count}
</span>
```

### Spinners

```tsx
<div className="rounded-full border border-white/20 animate-spin" style={{ width: 32, height: 32, borderTopColor: 'white', borderWidth: '2px' }} />
```

---

## Layout Patterns

### Mobile-First iPhone Mockup

The app renders inside a fixed-width iPhone frame on all pages:

```tsx
<div className="w-full max-w-[402px] min-h-screen bg-black relative">
  {/* Page content */}
</div>
```

**Viewport:** 402px × 874px (portrait)

### Burger Menu Button
```tsx
<button
  data-screenshot-hide="true"
  className="group relative w-12 h-12 flex items-center justify-center hover:scale-105 transition-all duration-300 flex-shrink-0 rounded-full"
  style={{ background: 'rgba(55, 65, 81, 0.8)', backdropFilter: 'blur(20px)' }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>
```

**Position:** Absolute, top-left, inside the iPhone frame (`absolute top-4 left-4 z-20`)

### Floating Navigation Bar
```tsx
<div className="fixed bottom-4 sm:bottom-8 z-40 transition-all duration-500">
  {/* Collapsible pill with circular nav buttons */}
</div>
```

**Position:** Fixed bottom-right
**Behavior:** Collapses to 48px circle, expands to ~340px on tap
**Background:** Black with white border

---

## Page Structure

### Standard Page Layout

```tsx
<div className="min-h-screen bg-black flex items-start justify-center">
  <div className="w-full max-w-[402px] min-h-screen bg-black relative flex flex-col"
    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05)' }}>
    
    <BurgerMenuButton />
    
    {/* Page header */}
    <div className="px-4 pt-16 pb-4">
      <h1 className="text-white text-lg font-bold">Page Title</h1>
    </div>
    
    {/* Main content */}
    <div className="flex-1 overflow-y-auto">
      {/* Content */}
    </div>
    
    <FloatingNavBar />
  </div>
</div>
```

### Standard Page Components

| Import | Usage |
|---|---|
| `BurgerMenuButton` | Top-left menu trigger |
| `FloatingNavBar` | Bottom-right navigation |
| `SynapseFitLogo` | Animated logo component |
| `PromptBoxOpenAI` | AI input with prompt box |
| `MuscleMapDisplay` | 3D anatomy visualization |
| `Spinner` | Loading spinner (inline component) |

---

## Animations

### Global Animations (CSS)

| Class | Effect | Duration |
|---|---|---|
| `animate-fadeIn` | Opacity 0→1 | 0.2s ease-out |
| `animate-scaleIn` | Scale 0.95→1 + fade | 0.3s cubic-bezier |
| `animate-spin` | 360° rotation | 1s linear infinite |
| `animate-bounce` | Y-axis bounce | 1s infinite |
| `animate-float` | Y/X float | 4s ease-in-out infinite |
| `animate-slide-right` | X-axis slide | 3s ease-in-out infinite |
| `animate-slide-left` | X-axis slide | 3s ease-in-out infinite |

### Logo Animations

| Class | Effect | Timing |
|---|---|---|
| `sf-anim-on .sf-line` | Stroke draw | 0.95s cubic-bezier |
| `sf-anim-on .sf-horn` | Stroke draw | 0.85s (0.25s delay) |
| `sf-anim-on .sf-word` | Stamp in | 0.5s (0.7s delay) |
| `sf-anim-on .sf-fit` | Stamp in | 0.4s (0.95s delay) |
| `sf-tagline-on` | Fade in | 0.5s (0.1s delay) |

### Transition Defaults

- **Hover Scale:** `hover:scale-105` or `hover:scale-110`
- **Active Scale:** `active:scale-95`
- **Duration:** `transition-all duration-300` (default) or `duration-500` (for complex transitions)
- **Easing:** `ease-out` for most, `cubic-bezier(0.16, 1, 0.3, 1)` for modals

---

## Scrollbar Styles

```css
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 999px; }
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|---|---|---|
| **Mobile** | < 640px | Default (iPhone frame) |
| **Tablet** | 640px+ | Feature grids, landing page |
| **Desktop** | 1024px+ | Landing page full layout |

**Note:** The app itself is designed primarily for mobile (402px viewport). Responsive breakpoints are mainly used for the landing page and marketing content.

---

## Dark Mode Only

The app is dark-mode only. No light theme toggle exists. All styling assumes a dark background.

- Background: `#0a0a0a` (near-black)
- Gradients: `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)`
- Ambient glow: `radial-gradient(circle, rgba(252, 76, 2, 0.06) 0%, transparent 70%)`

---

## Icon System

- **Library:** Lucide React (`lucide-react`)
- **Style:** 24×24 viewBox, `strokeWidth: 2`, `strokeLinecap: "round"`, `strokeLinejoin: "round"`
- **Custom SVGs:** Inline for complex icons (logo, nav, etc.)

---

## Key Design Principles

1. **Mobile-first:** All pages render inside a 402px iPhone frame
2. **Dark aesthetic:** Near-black backgrounds with white text and orange accents
3. **Glass morphism:** Semi-transparent surfaces with backdrop blur
4. **Minimal chrome:** Floating nav, minimal headers, content-focused
5. **Gesture-driven:** Long-press, swipe, tap interactions
6. **Optimistic UI:** Updates feel instant (local state before API)
7. **Real-time:** Pusher for chat, web-push for notifications
8. **AI-integrated:** AI coach appears contextually, not as a separate chat

---

## File Naming Conventions

| Pattern | Example |
|---|---|
| Pages | `src/app/{feature}/page.tsx` |
| Components | `src/components/{ComponentName}.tsx` |
| Hooks | `src/lib/hooks/{useHookName}.ts` |
| API Routes | `src/app/api/{domain}/{action}/route.ts` |
| Types | `src/lib/types/{typeName}.ts` |
| Utilities | `src/lib/{utilityName}.ts` |

---

## Tailwind Configuration

The app uses Tailwind CSS with custom utility classes:

- **Font Family:** `--font-hanalei-fill` (Hanalei Fill)
- **Colors:** No custom palette defined in `tailwind.config.js` — all colors are inline
- **Dark Mode:** Not used (app is always dark)
- **Custom Animations:** Defined in `globals.css` with `@keyframes`

---

## Screenshot Mode

To capture app screenshots, add `?show=true` to any URL:

```
http://localhost:3000/workout-tracker?show=true
```

This mode:
- Hides burger menu, floating nav, PWA buttons
- Seeds mock user and data into localStorage
- Renders at full viewport width (no constraints)
- Uses Playwright or browser dev tools for capture
