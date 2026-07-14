# P0: Shared Components — Slate-to-Token Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the "two design systems" inconsistency by migrating all shared/layout/dashboard components from hardcoded `slate-*`/`white`/`gray-*` colors to the project's CSS token variables.

**Architecture:** Each component's Tailwind classes are remapped from literal colors to CSS variable tokens (`--background`, `--card`, `--border`, `--muted`, `--muted-foreground`, etc.) defined in `globals.css` `:root` / `@theme inline`. Components within the `Card` system inherit card styling — only the outer shell and structural elements need explicit tokens.

**Tech Stack:** Next.js 16, Tailwind CSS v4 (JIT), shadcn/ui primitives

## Global Constraints

- Color tokens: use ONLY `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `divide-border` — no `slate-*`, `gray-*`, or `white` literals
- The `border-[0.5px]` pattern from the design system should replace `border` (1px) where the new system uses hairline borders
- Glassmorphism pattern: `bg-card/85 backdrop-blur-xl saturate-[1.4]` for elevated surfaces
- Reduced-motion / accessibility rules already in globals.css — do NOT touch
- All Card-based components (`Card`, `CardContent`, `CardHeader`) already have design token defaults — use `className` only for overrides
- The `PageHeader` component's accent left-border gradient (`from-emerald-500 via-teal-500 to-sky-500`) is intentional — preserve it
- No functional changes — this is purely class-name migration. If a component currently uses `<span className="text-slate-500">`, the replacement is `<span className="text-muted-foreground">`.

---

## Token Mapping Reference (Use for ALL tasks)

| Hardcoded (BEFORE) | Design Token (AFTER) | Context Rule |
|---|---|---|
| `bg-white` | `bg-card` | Container/surface backgrounds |
| `bg-white/75` | `bg-card/75` | With opacity |
| `via-white/20`, `to-white` | `via-background/20`, `to-background` | Gradient fades to page bg |
| `bg-slate-50/80` | `bg-muted/80` | Muted header/section backgrounds |
| `bg-slate-100` | `bg-muted` | Icon wrappers, secondary fills |
| `text-slate-950` | `text-foreground` | Primary headings, strong text |
| `text-slate-700` | `text-foreground` or `text-muted-foreground` | Medium-emphasis text on fills |
| `text-slate-600` | `text-muted-foreground` | Body/description text |
| `text-slate-500` | `text-muted-foreground` | Labels, secondary text |
| `text-slate-400` | `text-muted-foreground` | Low-emphasis (icons, hints) |
| `border-slate-200` | `border-border` | Card/section borders |
| `border-slate-200` (on Card) | `border-border/60` | Hairline sub-borders (matches design system pattern) |
| `border-gray-200` | `border-border/60` | Same as above |
| `hover:border-slate-300` | `hover:border-border` | Hover border states |
| `divide-slate-100` | `divide-border/60` | Dividers between rows |
| `border-t-[#22c55e]` | `border-t-primary` | Accent green top-border — `#22c55e` IS the primary color |
| `ring-slate-200/70` | `ring-border/70` | Focus/selection rings |
| `shadow-sm` | `shadow-sm` | Keep as-is (not a color) |
| `shadow-xs` | `shadow-xs` | Keep as-is |
| `text-[11px] font-semibold uppercase tracking-wide` | Keep as-is (typography, not color) | But change `text-slate-500` to `text-muted-foreground` |
| `rounded-lg` | Keep as-is | Matches `--radius-lg` |

---

### Task 1: `filter-card.tsx` — Full Token Migration

**Files:**
- Modify: `src/components/shared/filter-card.tsx` (lines 53, 56, 59, 63-64, 73, 85, 99, 105, 108-109, 123, 140-141)

**Token Mapping (Row by Row):**

| Line(s) | Before | After |
|---|---|---|
| 53 | `border-slate-200 bg-white` | `border-border/60 bg-card` |
| 56 | `border-b border-slate-200 bg-slate-50/80` | `border-b border-border/60 bg-muted/80` |
| 59 | `border border-slate-200 bg-white text-slate-700` | `border border-border/60 bg-card text-foreground` |
| 63 | `text-slate-950` | `text-foreground` |
| 64 | `text-slate-500` | `text-muted-foreground` |
| 73 | `border-slate-200 bg-white text-slate-500` | `border-border/60 bg-card text-muted-foreground` |
| 85 | `bg-white` | `bg-card` |
| 99 | `border-t border-slate-100 bg-white` | `border-t border-border/60 bg-card` |
| 105 | `border border-slate-200 bg-slate-50 text-slate-700` | `border border-border/60 bg-muted text-foreground` |
| 108 | `text-slate-500` | `text-muted-foreground` |
| 109 | `text-slate-950` | `text-foreground` |
| 110 | `text-slate-400` | `text-muted-foreground` |
| 123 | `text-slate-500` | `text-muted-foreground` |
| 140 | `text-slate-400` | `text-muted-foreground` |
| 141 | `bg-white` | `bg-card` |

- [ ] **Step 1.1 — Migrate outer Card wrapper (line 53)**

Replace:
```tsx
className={cn('mb-4 overflow-hidden border-slate-200 bg-white py-0 shadow-sm', className)}
```
with:
```tsx
className={cn('mb-4 overflow-hidden border-border/60 bg-card py-0 shadow-sm', className)}
```

- [ ] **Step 1.2 — Migrate header bar (line 56)**

Replace:
```tsx
<div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
```
with:
```tsx
<div className="border-b border-border/60 bg-muted/80 px-4 py-3">
```

- [ ] **Step 1.3 — Migrate filter icon wrapper (line 59)**

Replace:
```tsx
className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-xs"
```
with:
```tsx
className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card text-foreground shadow-xs"
```

- [ ] **Step 1.4 — Migrate header title and description (lines 63-64)**

Replace:
```tsx
<h2 className="truncate text-sm font-semibold text-slate-950">{title}</h2>
<p className="text-xs text-slate-500">{resultLabel}</p>
```
with:
```tsx
<h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
<p className="text-xs text-muted-foreground">{resultLabel}</p>
```

- [ ] **Step 1.5 — Migrate active filter badge default state (line 73)**

Replace `'border-slate-200 bg-white text-slate-500'` with `'border-border/60 bg-card text-muted-foreground'`

- [ ] **Step 1.6 — Migrate Reset button (line 85)**

Replace `className="h-8 bg-white px-2.5 text-xs"` with `className="h-8 bg-card px-2.5 text-xs"`

- [ ] **Step 1.7 — Migrate active filters tag bar (line 99)**

Replace:
```tsx
<div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-4 py-3">
```
with:
```tsx
<div className="flex flex-wrap gap-2 border-t border-border/60 bg-card px-4 py-3">
```

- [ ] **Step 1.8 — Migrate individual filter tags (lines 105-110)**

Replace:
```tsx
className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 transition-colors hover:border-slate-300 hover:bg-white ..."
```
with:
```tsx
className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-muted px-2.5 text-xs text-foreground transition-colors hover:border-border hover:bg-card ..."
```

Then inside the tag:
Replace `<span className="shrink-0 font-medium text-slate-500">` with `text-muted-foreground`
Replace `<span className="max-w-[16rem] truncate text-slate-950">` with `text-foreground`
Replace `<X className="h-3 w-3 shrink-0 text-slate-400" />` with `text-muted-foreground`

- [ ] **Step 1.9 — Migrate FilterField label (line 123)**

Replace `text-slate-500` with `text-muted-foreground`

- [ ] **Step 1.10 — Migrate FilterSearchField icon and input (lines 140-141)**

Replace `text-slate-400` with `text-muted-foreground` on the search icon
Replace `bg-white` with `bg-card` on the Input

- [ ] **Step 1.11 — Verify no slate references remain**

```bash
Select-String -Path "src/components/shared/filter-card.tsx" -Pattern "slate-" -CaseSensitive
```
Expected: no matches (exit code 1).

- [ ] **Step 1.12 — Run diagnostics**

```bash
cd scholarship-tracking-system && npx tsc --noEmit --pretty 2>&1 | Select-String "filter-card"
```
Expected: zero type errors.

---

### Task 2: `page-header.tsx` — Token Migration

**Files:**
- Modify: `src/components/layout/page-header.tsx` (lines 20, 46, 50, 56)

**Token Mapping:**

| Line(s) | Before | After |
|---|---|---|
| 20 | `border border-slate-200 bg-white shadow-sm` | `border border-border/60 bg-card shadow-sm` |
| 46 | `text-slate-950` | `text-foreground` |
| 50 | `text-slate-600` | `text-muted-foreground` |
| 56 | `bg-white/75 ... ring-1 ring-slate-200/70 backdrop-blur` | `bg-card/75 ... ring-1 ring-border/70 backdrop-blur` |

- [ ] **Step 2.1 — Migrate section wrapper (line 20)**

Replace:
```tsx
'relative isolate mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
```
with:
```tsx
'relative isolate mb-6 overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm',
```

- [ ] **Step 2.2 — Migrate title (line 46)**

Replace `text-slate-950` with `text-foreground`

- [ ] **Step 2.3 — Migrate description (line 50)**

Replace `text-slate-600` with `text-muted-foreground`

- [ ] **Step 2.4 — Migrate children wrapper (line 56)**

Replace `bg-white/75 ... ring-1 ring-slate-200/70 backdrop-blur` with `bg-card/75 ... ring-1 ring-border/70 backdrop-blur`

- [ ] **Step 2.5 — Verify no slate references remain**

```bash
Select-String -Path "src/components/layout/page-header.tsx" -Pattern "slate-" -CaseSensitive
```
Expected: no matches.

---

### Task 3: `dashboard-loading-state.tsx` — Token Migration

**Files:**
- Modify: `src/components/dashboard/dashboard-loading-state.tsx` (lines 8, 22, 36, 43-45, 53, 58-59, 69)

**Token Mapping:**

| Line(s) | Before | After |
|---|---|---|
| 8 | `border-b border-slate-200` | `border-b border-border/60` |
| 22 | `rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm` | `rounded-xl border border-border/60 bg-card px-5 py-5 shadow-sm` (use `rounded-xl` to match Card pattern) |
| 36 | `rounded-lg border border-slate-200 bg-white shadow-sm` | `rounded-xl border border-border/60 bg-card shadow-sm` |
| 43 | `rounded-lg border-slate-200 bg-white py-0 shadow-sm` | `rounded-xl border-border/60 bg-card py-0 shadow-sm` |
| 44 | `border-b border-slate-200` | `border-b border-border/60` |
| 53 | `rounded-lg border border-slate-200 bg-white shadow-sm` | `rounded-xl border border-border/60 bg-card shadow-sm` |
| 58 | `rounded-lg border border-slate-200 bg-white shadow-sm` | `rounded-xl border border-border/60 bg-card shadow-sm` |
| 59 | `border-b border-slate-200` | `border-b border-border/60` |
| 69 | `divide-y divide-slate-100` | `divide-y divide-border/60` |

- [ ] **Step 3.1 through 3.9** — Apply each row from the table above, one className replacement per step.

- [ ] **Step 3.10 — Verify**

```bash
Select-String -Path "src/components/dashboard/dashboard-loading-state.tsx" -Pattern "slate-" -CaseSensitive
```
Expected: no matches.

---

### Task 4: `dashboard-error-state.tsx` — Token Migration

**Files:**
- Modify: `src/components/dashboard/dashboard-error-state.tsx` (lines 10-15)

**Token Mapping:**

| Line(s) | Before | After |
|---|---|---|
| 10 | `rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm` | `rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm` |
| 11 | `bg-slate-100 text-slate-700` | `bg-muted text-foreground` |
| 14 | `text-slate-950` | `text-foreground` |
| 15 | `text-slate-500` | `text-muted-foreground` |

- [ ] **Step 4.1** — Apply each mapping
- [ ] **Step 4.2** — Verify no slate references remain

---

### Task 5: `skeleton-loaders.tsx` — Token Migration

**Files:**
- Modify: `src/components/shared/skeleton-loaders.tsx` (lines 16, 22)

**Token Mapping:**

| Line(s) | Before | After |
|---|---|---|
| 16 | `border-gray-200 border-t-4 border-t-[#22c55e] bg-white` | `border-border/60 border-t-4 border-t-primary bg-card` |
| 22 | `via-white/20 to-white` | `via-background/20 to-background` |

- [ ] **Step 5.1** — Migrate Card wrapper (line 16)

Replace:
```tsx
<Card className="relative mb-6 overflow-hidden border-gray-200 border-t-4 border-t-[#22c55e] bg-white">
```
with:
```tsx
<Card className="relative mb-6 overflow-hidden border-border/60 border-t-4 border-t-primary bg-card">
```

Note: `#22c55e` is the emerald-500 shade, which maps to the project's primary color. Using `border-t-primary` ties it to the design token.

- [ ] **Step 5.2** — Migrate gradient overlay (line 22)

Replace:
```tsx
className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-transparent via-white/20 to-white"
```
with:
```tsx
className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-transparent via-background/20 to-background"
```

- [ ] **Step 5.3** — Verify

```bash
Select-String -Path "src/components/shared/skeleton-loaders.tsx" -Pattern "slate-|gray-|#22c55e" -CaseSensitive
```
Expected: no matches for `slate-`, `gray-`, or `#22c55e`.

---

## Smoke Test (Run After ALL Tasks)

- [ ] **Build check:**

```bash
cd scholarship-tracking-system && pnpm run build 2>&1 | Select-String -NotMatch "✓|⚡|info|✓ Compiled"
```
Expected: clean build with no errors. Only build-info output.

- [ ] **Runtime visual check:** Navigate to:
  - Dashboard (loading state, error state, loaded state)
  - Students page (filter card)
  - Reports page (page header)
  - Confirm backgrounds render correctly (no white-on-white or invisible text)
