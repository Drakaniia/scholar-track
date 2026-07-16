# Apple Design Redesign — ScholarTrack

**Date:** 2026-07-14
**Scope:** Full UI overhaul applying Apple Design principles
**Theme:** Light, refined, translucent materials, spring-based motion
**Login page:** Keep dark distinct portal experience (polish only)

---

## 1. Design Tokens & Foundation

### Color Palette

- **Primary accent:** Emerald — refined `#1a8a5c` (was `#22c55e`)
- **Surface background:** `oklch(0.985 0.002 160)` — warm off-white
- **Card background:** `oklch(0.995 0.001 160)` — near-white faint warmth
- **Text primary:** `oklch(0.15 0.008 160)` — soft black
- **Text secondary:** `oklch(0.45 0.012 160)` — warm gray
- **Border:** `oklch(0.92 0.006 160)` — subtle warm
- **Sidebar accent:** Matches primary (no separate green identity)
- **Destructive:** Rose-tinted
- **Charts:** Restrained 5-color — emerald, teal, amber, rose, slate

### Typography

- **Font:** Inter (keep), with `font-optical-sizing: auto`
- **Display (h1):** `clamp(2rem, 3vw, 2.75rem)`, leading `1.05`, tracking `-0.025em`
- **Subhead (h2):** `clamp(1.25rem, 2vw, 1.5rem)`, leading `1.15`, tracking `-0.015em`
- **Title (h3):** `1rem`, leading `1.2`, tracking `0`
- **Body:** `0.9375rem`, leading `1.6`, tracking `0.012em`
- **Caption/small:** `0.8125rem`, leading `1.4`, tracking `0.02em`
- **Label/UI:** `0.75rem`, leading `1`, `font-semibold`, tracking `0.04em`, uppercase

### Spacing Rhythm (8px grid)

- Content padding: `p-6 md:p-8`
- Card padding: `p-5`
- Section gap: `gap-6`
- Element gap inside cards: `gap-3`

### Shadows

```css
--shadow-sm:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 1px 3px rgba(15, 23, 42, 0.06) --shadow-md: 0 2px 8px rgba(15, 23, 42, 0.04),
  0 4px 16px rgba(15, 23, 42, 0.06) --shadow-lg: 0 4px 16px rgba(15, 23, 42, 0.04),
  0 8px 32px rgba(15, 23, 42, 0.06);
```

---

## 2. Material Language

### Header (Chrome)

- `rgba(253, 253, 252, 0.72)`, `backdrop-filter: blur(24px) saturate(180%)`
- Bottom border: `0.5px rgba(0,0,0,0.06)` hairline
- Content scrolls under header

### Cards

- `rgba(255, 255, 255, 0.82)`, `backdrop-filter: blur(12px) saturate(160%)`
- Hairline border: `0.5px solid rgba(0,0,0,0.04)`
- Radius: `12px`, shadow: `--shadow-sm`
- Hover: `--shadow-md`, `-1px` translateY
- **No accent-top bars**

### Sheet / Dialog / Popover

- `rgba(255, 255, 255, 0.88)`, `backdrop-filter: blur(32px) saturate(180%)`
- Hairline border, `--shadow-lg`

### Navigation (desktop)

- Container: `rgba(250, 250, 249, 0.6)`, `backdrop-filter: blur(16px)`
- Active: `rgba(26, 138, 92, 0.12)` background

### Background

- Keep DotPattern but reduce opacity to `opacity-30`, smaller/tighter dots
- Add subtle radial gradient warmth at center

---

## 3. Component Library

### Button

- Height: `44px` (default), `36px` (sm), `48px` (lg)
- Radius: `10px` (rounded-lg)
- Press: `scale(0.97)` on `:active` with `transition: transform 100ms ease-out`
- Variants:
  - **Primary:** Solid emerald-700 bg, white text
  - **Secondary:** `rgba(0,0,0,0.04)` bg, text-slate-700
  - **Outline:** `0.5px rgba(0,0,0,0.1)` border, no fill until hover
  - **Ghost:** No border, subtle bg on hover
  - **Destructive:** Rose tint
  - Remove gradient variant

### Input / Select / Textarea

- Height: `44px`
- Border: `0.5px rgba(0,0,0,0.08)` hairline
- Focus: `ring-2` primary at 15% opacity, no border color change
- Bg: `rgba(255,255,255,0.8)` with `backdrop-filter: blur(4px)`
- Radius: `10px`
- Placeholder: text-slate-400

### Card

- Translucent material (`rgba(255,255,255,0.82)`, `blur(12px)`)
- Hairline border, radius `12px`, padding `p-5`
- Header: flex row, hairline border-b if needed
- Title: `text-sm font-semibold`
- Content: `gap-3`

### Table

- Header: `text-[11px] uppercase tracking-wider text-slate-400`, transparent bg
- Row: hairline border-b, hover with subtle bg
- Cells: `py-3 text-sm`
- No alternating colors

### Badge

- Radius: `6px`, padding `2px 8px`, font `11px font-medium`
- Variants: solid or translucent (emerald, amber, rose, slate)

### Dialog / Sheet

- Same Radix primitives for behavior
- Sheet: `w-[320px]`, translucent material, spring slide + opacity
- Dialog: `max-w-[480px]`, translucent, scrim `rgba(0,0,0,0.3)`

### Tabs

- List: hairline border-b
- Trigger: `text-sm px-4`, active has underline spring animation
- No bg pills

---

## 4. Motion System

### Page Transitions (Motion)

- Entry: `{ opacity: 1, y: 0 }` — spring `{ bounce: 0, duration: 0.35 }`
- Exit: `{ opacity: 0 }` — `{ duration: 0.1 }`

### Micro-interactions

| Element      | Action      | Response                                |
| ------------ | ----------- | --------------------------------------- |
| Button press | pointerdown | `scale(0.97)` instant CSS               |
| Button hover | mouseenter  | bg shift, 200ms ease                    |
| Card hover   | mouseenter  | shadow elevation + -1px Y, spring 0.3s  |
| Dialog open  | mount       | `scale(0.95→1)` + opacity, spring 0.35s |
| Dialog close | unmount     | opacity fade 100ms                      |
| Sheet open   | mount       | slide + opacity, spring 0.4s            |
| Tabs active  | change      | underline slide (spring)                |

### Reduced motion

- Use existing `useReducedMotion` hook
- Cross-fades only when reduced motion preferred

---

## 5. Layout & Navigation

- **Header:** Keep current structure but apply material layer
- **Content:** `p-6 md:p-8`, `space-y-6` between sections
- **KPI strip:** `gap-4` (was `gap-3`), same grid
- **Login page:** Polish only — refine glass card, typography, spacing. Keep dark theme.

---

## 6. Files to Modify

### CSS & Theme

- `src/app/globals.css` — Rewrite all CSS variables, @theme, shadows, typography

### Layout Components

- `src/components/layout/sidebar.tsx` — Refine header material, nav pills, spacing
- `src/components/layout/layout-wrapper.tsx` — Update MainContent padding

### UI Components (Full Rewrite)

- `src/components/ui/button.tsx` — New variants, press feedback, Apple proportions
- `src/components/ui/card.tsx` — Translucent material, refined padding
- `src/components/ui/input.tsx` — Hairline border, blur bg, new height
- `src/components/ui/select.tsx` — Match input styling
- `src/components/ui/textarea.tsx` — Match input styling
- `src/components/ui/table.tsx` — Hairline borders, cleaner header
- `src/components/ui/badge.tsx` — New radius, padding, variants
- `src/components/ui/dialog.tsx` — Material pass, spring animation
- `src/components/ui/sheet.tsx` — Material pass, spring animation
- `src/components/ui/tabs.tsx` — Underline style, spring animation
- `src/components/ui/dropdown-menu.tsx` — Material pass

### Dashboard Components

- `src/components/dashboard/dashboard-hero.tsx` — Remove accent bar, refine spacing
- `src/components/dashboard/stats-card.tsx` — Remove accent-top, material card
- `src/components/dashboard/dashboard-kpi-strip.tsx` — Refine for new card style
- `src/components/dashboard/recent-awards.tsx` — Refine table, remove accent

### Page Transition

- `src/components/layout/page-transition.tsx` — Spring-based variants

### Login Page

- `src/app/login/page.tsx` — Polish glass card, typography, spacing

### Root Layout

- `src/app/layout.tsx` — Reduce dot-pattern opacity

---

## 7. Non-Goals (Out of Scope)

- Functional changes to API, auth, data flow, backend logic
- Adding new features or pages
- GSAP integration into core UI
- Theme toggle (light/dark)
