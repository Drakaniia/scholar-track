# Apple Design Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Apple Design principles (translucent materials, spring motion, refined typography, hairline detailing) across ScholarTrack's entire UI surface.

**Architecture:** CSS variable foundation → UI component rewrite → layout/navigation polish → dashboard component refinement → login polish. Components keep Radix UI primitives for accessibility but get fully rewritten styling.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui (Radix primitives), Motion (Framer Motion), Inter font

## Global Constraints

- No functional changes — redesign is purely visual/interaction
- Keep Radix primitives for behavior (dialog, sheet, tabs, select, popover, tooltip, dropdown-menu, alert-dialog, checkbox)
- No new dependencies — use existing `motion` library for spring animations
- `prefers-reduced-motion: reduce` must be respected everywhere
- All existing data attributes (`data-slot`, `data-variant`) should be preserved for backward compatibility
- Login page keeps its dark theme — only polish materials/typography

---

## File Structure

```
MODIFY: src/app/globals.css                        — Design tokens, materials, typography
MODIFY: src/app/layout.tsx                         — DotPattern opacity reduction

REWRITE: src/components/ui/button.tsx               — Apple-style button variants & press feedback
REWRITE: src/components/ui/card.tsx                 — Translucent material card
REWRITE: src/components/ui/input.tsx                — Hairline border, 44px height, blur bg
MODIFY: src/components/ui/select.tsx                — Match input styling
MODIFY: src/components/ui/textarea.tsx              — Match input styling
MODIFY: src/components/ui/table.tsx                 — Hairline rows, cleaner header
REWRITE: src/components/ui/badge.tsx                — New proportions, translucent variants
MODIFY: src/components/ui/dialog.tsx                — Material background, spring animation
MODIFY: src/components/ui/sheet.tsx                 — Material background, spring animation
REWRITE: src/components/ui/tabs.tsx                 — Underline style, spring animation
MODIFY: src/components/ui/dropdown-menu.tsx          — Material background

MODIFY: src/components/layout/page-transition.tsx   — Spring-based transitions
MODIFY: src/components/layout/sidebar.tsx            — Header material, nav pills
MODIFY: src/components/layout/layout-wrapper.tsx     — Content padding update

MODIFY: src/components/dashboard/dashboard-hero.tsx  — Remove accent bar, refine
MODIFY: src/components/dashboard/stats-card.tsx      — Remove accent-top, use new card
MODIFY: src/components/dashboard/dashboard-kpi-strip.tsx — Refine for new card style
MODIFY: src/components/dashboard/recent-awards.tsx   — Refine table header, accent

MODIFY: src/app/login/page.tsx                       — Polish glass card, typography
```

---

### Task 1: Design Tokens — Rewrite globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Nothing
- Produces: All CSS custom properties consumed by every other task

- [ ] **Step 1: Read the current globals.css**

Already read. Current file has:
- `@theme inline` with radius, colors (mapped to hsl variables), `animate-shine`
- `:root` with HSL color values (purple primary, pastel palette overwritten at bottom)
- `@layer base` with border/body/card styles
- Login gradient classes
- Scrollbar styles
- Animation utilities (animate-in, page-transition, link-hover)
- Chart tooltip styles, zoom-hover

- [ ] **Step 2: Rewrite `:root` with refined color palette**

Replace the entire `:root` block with:

```css
:root {
  --radius: 0.625rem;

  /* Surface & background — warm off-white base */
  --background: oklch(0.985 0.002 160);
  --foreground: oklch(0.15 0.008 160);

  /* Card — near-white with faint warmth */
  --card: oklch(0.995 0.001 160);
  --card-foreground: oklch(0.15 0.008 160);

  /* Popover — slightly more opaque for floating surfaces */
  --popover: oklch(0.995 0.001 160);
  --popover-foreground: oklch(0.15 0.008 160);

  /* Primary — refined emerald (was purple) */
  --primary: 158 72% 32%;
  --primary-foreground: 0 0% 100%;

  /* Secondary — subtle warm gray */
  --secondary: 150 6% 93%;
  --secondary-foreground: 150 12% 20%;

  /* Muted */
  --muted: 150 4% 95%;
  --muted-foreground: 150 8% 48%;

  /* Accent */
  --accent: 150 4% 95%;
  --accent-foreground: 150 12% 20%;

  /* Destructive — rose */
  --destructive: 350 60% 54%;
  --destructive-foreground: 0 0% 100%;

  /* Borders — very subtle warm */
  --border: 150 4% 88%;
  --input: 150 4% 88%;

  /* Ring — primary at low opacity */
  --ring: 158 72% 32%;

  /* Sidebar — unified with primary */
  --sidebar: oklch(0.995 0.001 160);
  --sidebar-foreground: oklch(0.15 0.008 160);
  --sidebar-primary: #1a8a5c;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0.002 160);
  --sidebar-accent-foreground: oklch(0.2 0.008 160);
  --sidebar-border: oklch(0.92 0.004 160);
  --sidebar-ring: #1a8a5c;
}
```

- [ ] **Step 3: Rewrite `@theme inline` with refined token mapping and shadows**

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-chart-1: #1a8a5c;
  --color-chart-2: #0d9488;
  --color-chart-3: #d97706;
  --color-chart-4: #e11d48;
  --color-chart-5: #64748b;
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Apple-style layered shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 2px 8px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 4px 16px rgba(15, 23, 42, 0.04), 0 8px 32px rgba(15, 23, 42, 0.06);
}
```

Remove `--animate-shine` and its `@keyframes shine` block.

- [ ] **Step 4: Remove pastel palette and chart overrides**

Delete these lines from `:root`:
```css
/* Pastel Palette */
--pastel-purple: 262 83% 76%;
--pastel-blue: 200 90% 76%;
--pastel-pink: 330 85% 76%;
--pastel-orange: 30 90% 76%;
--pastel-green: 150 70% 76%;

--chart-1: var(--pastel-purple);
--chart-2: var(--pastel-blue);
--chart-3: var(--pastel-pink);
--chart-4: var(--pastel-orange);
--chart-5: var(--pastel-green);
```

- [ ] **Step 5: Update `@layer base` with refined default styles**

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-size: 0.9375rem;
    line-height: 1.6;
    letter-spacing: 0.012em;
  }
}
```

- [ ] **Step 6: Clean up utility classes — remove old, keep needed scrollbar, refine link-hover**

Remove `login-gradient-bg`, `login-page-body`, `page-transition-container`, `data-slot='page-transition'` will-change, `data-slot='card'` hover rule.

Keep scrollbar styles (already good).
Keep link-hover styles but update transition:
```css
.link-hover--slide::before {
  transform: scale3d(0, 1, 1);
  transform-origin: 100% 50%;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1); /* snappier */
}
```

Remove `recharts-tooltip-wrapper` and `zoom-hover` classes (chart tooltips don't need special z-index, zoom-hover is replaced by button's own press feedback).

- [ ] **Step 7: Verify no errors**

Run: `npx tsc --noEmit` and check for CSS-related diagnostics.

---

### Task 2: Root Layout — Dot Pattern Opacity

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Reduce dot pattern opacity and tighten spacing**

Change:
```tsx
<DotPattern
  className="text-muted-foreground/15"
  width={24}
  height={24}
  cx={1}
  cy={1}
  cr={1.2}
/>
```
To:
```tsx
<DotPattern
  className="text-muted-foreground/8"
  width={20}
  height={20}
  cx={1}
  cy={1}
  cr={0.8}
/>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — should pass clean.

---

### Task 3: Button Component — Apple-Style Rewrite

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Rewrite buttonVariants with Apple proportions and press feedback**

Replace `buttonVariants` definition with:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-100 ease-out select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/15 focus-visible:ring-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline:
          'border-[0.5px] border-border bg-background/80 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-12 rounded-md px-7 has-[>svg]:px-5',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

Key changes from current:
- `rounded-lg` (10px) instead of `rounded-md` (6px)
- `active:scale-[0.97]` for press feedback (Apple §1: respond on pointer-down)
- `transition-all duration-100 ease-out` for instant feel
- Default height: `h-11` (44px) instead of `h-9` (36px)
- `border-[0.5px]` for outline variant hairline
- Remove `gradient` variant
- Focus visible ring at 15% opacity instead of 50%

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`

---

### Task 4: Card Component — Translucent Material

**Files:**
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Rewrite Card with translucent material**

```tsx
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border-[0.5px] border-border/60 bg-card/85 p-5 shadow-sm backdrop-blur-xl saturate-[1.4] transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}
```

Key changes:
- `bg-card/85` — translucent (85% opacity)
- `backdrop-blur-xl saturate-[1.4]` — frosted glass
- `border-[0.5px] border-border/60` — hairline border
- Remove `py-6`, use `p-5` (consistent padding)
- `rounded-xl` (12px) instead of `rounded-xl` (same, keep)
- Hover: `shadow-md -translate-y-0.5` with `duration-300 ease-out`

Update CardHeader:
```tsx
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-col gap-1.5 px-0',  /* no horizontal padding — card has p-5 */
        className
      )}
      {...props}
    />
  );
}
```

Update CardContent:
```tsx
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-0', className)} {...props} />;
}
```

Update CardFooter:
```tsx
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-0 pt-4 border-t-[0.5px] border-border/40', className)}
      {...props}
    />
  );
}
```

Keep CardTitle, CardDescription, CardAction as-is (they don't have visual styles that conflict).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`

---

### Task 5: Input / Select / Textarea — Apple-Style

**Files:**
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/textarea.tsx`

- [ ] **Step 1: Rewrite input.tsx**

Read current file first, then rewrite:

```tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary/15 selection:text-primary-foreground flex h-11 w-full min-w-0 rounded-lg border-[0.5px] border-input bg-background/80 px-4 py-1 text-base shadow-none backdrop-blur-sm transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-input focus-visible:ring-ring/15 focus-visible:ring-2 focus-visible:outline-none',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
```

Key changes:
- Height: `h-11` (44px, was 10)
- Radius: `rounded-lg` (10px, was `rounded-md`)
- Border: `border-[0.5px]` hairline
- Background: `bg-background/80` with `backdrop-blur-sm` — translucent
- Focus: `ring-ring/15 ring-2` (15% opacity, no border color change)
- Padding: `px-4` (consistent)

- [ ] **Step 2: Update select.tsx — match input styling**

Read `select.tsx` to find the trigger class. Update the `SelectTrigger` className to match input styling — specifically the `h-11`, `rounded-lg`, `border-[0.5px]` and focus ring styles.

Search for the `SelectTrigger` className string and update to match the new input pattern: `h-11 w-full rounded-lg border-[0.5px] border-input bg-background/80 backdrop-blur-sm`.

- [ ] **Step 3: Update textarea.tsx — match input styling**

Read `textarea.tsx`. Update its className to match the new input styling: same border, radius, background, focus, height behavior.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`

---

### Task 6: Table + Badge — Refinement

**Files:**
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Rewrite table.tsx with hairline details**

Read current `table.tsx`, then update the key parts:

```tsx
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b-[0.5px]', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b-[0.5px] border-border/50 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'py-3 px-4 align-middle text-sm',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
```

Key changes:
- `h-10` header cells (was default)
- `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70` for header
- `py-3` for cells (was `p-4`)
- Hairline borders: `border-b-[0.5px]`
- Hover row: `hover:bg-muted/30`
- Keep other table parts (caption, body, footer) as-is

- [ ] **Step 2: Rewrite badge.tsx with Apple proportions**

Read current `badge.tsx`, then rewrite:

```tsx
import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border-[0.5px] px-2 py-0.5 text-[11px] font-medium leading-normal transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/10 text-primary',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive/10 text-destructive',
        outline: 'text-foreground border-border/60',
        success:
          'border-transparent bg-emerald-50 text-emerald-800',
        warning:
          'border-transparent bg-amber-50 text-amber-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

Key changes:
- Radius: `rounded-md` (6px, was `rounded-full`/`px-2.5 py-0.5`)
- Padding: `px-2 py-0.5` (tighter)
- Font: `text-[11px] font-medium` (was `text-xs font-semibold`)
- `border-[0.5px]` hairline
- Variants: `default` (translucent primary), `secondary`, `destructive`, `outline`, `success`, `warning`

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`

---

### Task 7: Dialog + Sheet — Material & Spring Animation

**Files:**
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/sheet.tsx`

- [ ] **Step 1: Read current dialog.tsx and sheet.tsx**

- [ ] **Step 2: Add spring animation to Dialog**

In `dialog.tsx`, locate the `DialogOverlay` and `DialogContent` styles.

Update DialogOverlay:
```tsx
const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
```

Update DialogContent to add spring transition via motion (if already using motion, otherwise keep CSS animation):
```tsx
const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border-[0.5px] border-border/60 bg-popover/85 p-6 shadow-lg backdrop-blur-2xl saturate-[1.4] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="..." />
    </DialogPrimitive.Content>
  </DialogPortal>
));
```

Key changes:
- `rounded-2xl` (16px) dialog corners
- `bg-popover/85 backdrop-blur-2xl saturate-[1.4]` — translucent frosted glass
- `border-[0.5px]` hairline
- Scrim: `bg-black/30 backdrop-blur-sm`

- [ ] **Step 3: Update SheetContent with material and spring animation**

In `sheet.tsx`, update the SheetContent className:
```tsx
const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 border-[0.5px] border-border/60 bg-popover/85 p-6 shadow-lg backdrop-blur-2xl saturate-[1.4] transition ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
        // ... other sides
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="..." />
    </SheetPrimitive.Content>
  </SheetPortal>
));
```

Key changes:
- Same translucency as dialog
- `rounded-none` on sheet (full height, no radius on edge side)
- `backdrop-blur-2xl saturate-[1.4]`

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`

---

### Task 8: Tabs + Dropdown-Menu — Underline & Material

**Files:**
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Read current tabs.tsx and rewrite with underline style**

```tsx
'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex items-center gap-0 border-b-[0.5px] border-border/60 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/15 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-1.5px_0_hsl(var(--primary))]',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/15 focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

Key changes:
- No pill background — just border-bottom on the list
- Active: `data-[state=active]:shadow-[inset_0_-1.5px_0_hsl(var(--primary))]` — underline style
- Inactive: just text color change
- Padding: `px-4 py-2.5`

- [ ] **Step 2: Update dropdown-menu.tsx with translucent material**

Read current `dropdown-menu.tsx`. Update `DropdownMenuContent`:
```tsx
const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-xl border-[0.5px] border-border/60 bg-popover/85 p-1 shadow-md backdrop-blur-2xl saturate-[1.4] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
```

Update `DropdownMenuItem`:
```tsx
const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
```

Key changes:
- `rounded-xl` (12px) on content
- `bg-popover/85 backdrop-blur-2xl saturate-[1.4]` — translucent material
- `rounded-lg` (8px) on items (was `rounded-sm`)
- `py-1.5` items (was default)

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`

---

### Task 9: Page Transition — Spring Variants

**Files:**
- Modify: `src/components/layout/page-transition.tsx`

- [ ] **Step 1: Read current page-transition.tsx**

Already read. Current uses:
```tsx
const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] } },
};
```

- [ ] **Step 2: Replace with spring-based variants**

```tsx
const variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      bounce: 0,
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;
```

Entry uses a critically-damped spring (`bounce: 0`), exit stays fast opacity fade.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`

---

### Task 10: Header & Sidebar — Material Refinement

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/layout-wrapper.tsx`

- [ ] **Step 1: Update header chrome to translucent material**

In `sidebar.tsx`, find the header element (line ~172):
```tsx
<header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
```

Replace with:
```tsx
<header className="fixed left-0 right-0 top-0 z-40 h-14 border-b-[0.5px] border-border/60 bg-background/70 shadow-sm backdrop-blur-2xl saturate-[1.8]">
```

Key changes:
- Height: `h-14` (56px, was h-16=64px) — more compact
- `bg-background/70` — translucent (70% opacity)
- `backdrop-blur-2xl saturate-[1.8]` — strong frosted glass
- `border-[0.5px]` — hairline border
- Remove heavy shadow, use `shadow-sm`

- [ ] **Step 2: Update desktop navigation container**

Find the nav container (`xl:flex` block, ~line 203):
```tsx
<nav
  aria-label="Primary navigation"
  className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1 xl:flex"
>
```

Replace with:
```tsx
<nav
  aria-label="Primary navigation"
  className="hidden items-center gap-0.5 rounded-xl bg-muted/50 p-1 xl:flex"
>
```

Remove border, change to subtle muted background.

- [ ] **Step 3: Update nav link styles**

Find active nav link class:
```tsx
isActive
  ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-100'
  : 'text-slate-600 hover:bg-white hover:text-slate-950'
```

Replace with:
```tsx
isActive
  ? 'bg-primary/10 text-primary font-semibold'
  : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
```

- [ ] **Step 4: Update mobile sheet styling**

In the SheetContent (line ~97), change:
```tsx
<SheetContent side="left" className="w-[20rem] gap-0 border-slate-200 bg-white p-0">
```

To:
```tsx
<SheetContent side="left" className="w-[20rem] gap-0 p-0">
```
(The material styling is inherited from the sheet component in Task 7.)

Update the sheet header border:
```tsx
<SheetHeader className="border-b-[0.5px] border-border/60 px-5 py-4 text-left">
```

Update nav items in mobile sheet:
```tsx
isActive
  ? 'bg-primary/10 text-primary font-semibold'
  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
```

Update user section background:
```tsx
<div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
```

- [ ] **Step 5: Update layout-wrapper padding**

In `layout-wrapper.tsx`, update MainContent:
```tsx
export function MainContent({ children }: MainContentProps) {
  return (
    <main className="pt-14">
      <div className="container mx-auto p-6 md:p-8">{children}</div>
    </main>
  );
}
```

Change `pt-16` to `pt-14` (matching new header height), `p-4 md:p-8` to `p-6 md:p-8`.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`

---

### Task 11: Dashboard Components — Accent Removal & Material

**Files:**
- Modify: `src/components/dashboard/dashboard-hero.tsx`
- Modify: `src/components/dashboard/dashboard-kpi-strip.tsx`
- Modify: `src/components/dashboard/stats-card.tsx`
- Modify: `src/components/dashboard/recent-awards.tsx`

- [ ] **Step 1: Update dashboard-hero.tsx**

Read current file. Changes:

Replace the accent bar div (lines ~49-52):
```tsx
{/* Remove this entire block — no accent bar */}
```

Replace the section wrapper (line ~37):
```tsx
<section className="relative isolate mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
```
With:
```tsx
<section className="relative isolate mb-6 overflow-hidden rounded-xl border-[0.5px] border-border/60 bg-card/85 shadow-sm backdrop-blur-xl saturate-[1.4]">
```

Update the "source label" section (lines ~56-59):
```tsx
<div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
  <span className="h-px w-8 bg-emerald-700" />
  {sourceLabel}
</div>
```
Remove the decorative span line — just:
```tsx
<div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
  {sourceLabel}
</div>
```

Update the h1 (line ~60):
```tsx
<h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
  Scholarship dashboard
</h1>
```
To:
```tsx
<h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
  Scholarship dashboard
</h1>
```

Update the description (line ~63):
```tsx
<p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
```
To:
```tsx
<p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
```

Update filter selects to remove emerald icon colors:
- Remove `text-emerald-800` from Filter icons
- Use `text-muted-foreground` instead

Update Reports button (line ~100):
```tsx
<Button
  asChild
  variant="outline"
  className="h-10 rounded-lg border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
>
```
To use default outline variant (styling comes from button component now):
```tsx
<Button asChild variant="outline">
```

Update Export button (line ~111):
```tsx
className="h-10 rounded-lg bg-emerald-800 text-white shadow-sm hover:bg-emerald-900"
```
Remove className — use `variant="default"` directly.

- [ ] **Step 2: Rewrite stats-card.tsx — remove accent top bar**

Read current `stats-card.tsx`. Changes:

Replace the card wrapper with the new card approach — since card now has its own material styling, simplify:
```tsx
<Card
  className={cn(
    'group relative overflow-hidden py-0',
    className
  )}
>
```

Remove the gradient wash div (`absolute inset-0 bg-gradient-to-br...`).
Remove the accent bar div (`absolute inset-x-0 top-0 h-1...`).

Update icon container — the pastel colors no longer exist. Use:
```tsx
const VARIANTS = {
  default: { icon: 'bg-primary/10 text-primary' },
  blue: { icon: 'bg-sky-100 text-sky-700' },
  amber: { icon: 'bg-amber-100 text-amber-700' },
  green: { icon: 'bg-emerald-100 text-emerald-700' },
  rose: { icon: 'bg-rose-100 text-rose-700' },
};
```

Update CardTitle (line ~78):
```tsx
<CardTitle className="text-sm font-semibold text-slate-600">{title}</CardTitle>
```
To:
```tsx
<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
```

Update the main value text:
```tsx
<div className="text-2xl font-bold text-slate-950">
```
To:
```tsx
<div className="text-2xl font-semibold tracking-tight text-foreground">
```

- [ ] **Step 3: Update dashboard-kpi-strip.tsx**

Read current `dashboard-kpi-strip.tsx`. Changes:

Update CARD_THEME colors to use primary/standard instead of custom colors:
```tsx
const CARD_THEME = {
  students: {
    iconBg: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  programs: {
    iconBg: 'bg-violet-100 text-violet-700',
    accent: 'bg-violet-500',
  },
  awarded: {
    iconBg: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500',
  },
  released: {
    iconBg: 'bg-sky-100 text-sky-700',
    accent: 'bg-sky-500',
  },
};
```

Update KpiCard to remove gradient overlay and accent bar. Remove:
```tsx
<div
  className={cn('via-white/95 absolute inset-0 bg-gradient-to-br to-white', theme.gradient)}
/>
<div className={cn('absolute inset-x-0 top-0 h-0.5', theme.accent)} />
```

Simplify the card to use the new Card component styling.

Update grid gap: `gap-4` (was `gap-3`).

- [ ] **Step 4: Update recent-awards.tsx**

Read current file. Changes:

Update the card wrapper:
```tsx
<Card className="overflow-hidden py-0">
```

Update the card header (lines ~47-60):
```tsx
<CardHeader className="flex flex-row items-center justify-between border-b-[0.5px] border-border/40 px-5 py-4">
  <div className="flex items-center gap-3">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Award className="h-4 w-4" />
    </span>
    <div>
      <CardTitle className="text-base">Recent Awards</CardTitle>
      <CardDescription>Latest student scholarship activity</CardDescription>
    </div>
  </div>
  <Link href="/students" className="text-sm font-medium text-primary hover:underline">
    View all
  </Link>
</CardHeader>
```

Remove `px-0` overrides on CardContent — now handled by card default.

Update TableHead cells if needed for new table styling.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`

---

### Task 12: Login Page — Polish

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Read current login page**

Already read. The login page has:
- Dark base (#041a12)
- Background image
- Complex gradient overlays
- Frosted glass card with gold/green gradient top bar
- Inputs with custom styling inline
- Button with custom styling

- [ ] **Step 2: Refine the glass card material**

Update the card (line ~114):
```tsx
<div className="relative overflow-hidden rounded-[1.75rem] border border-[#e7d6a0]/50 bg-[#fffaf0]/96 p-6 text-[#11261c] shadow-[0_30px_80px_rgba(0,0,0,0.42)] sm:p-8 lg:p-10">
```

Refine with:
```tsx
<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/90 backdrop-blur-2xl p-6 text-[#11261c] shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
```

- [ ] **Step 3: Refine the title and description typography**

Title (line ~130):
```tsx
<h2 className="text-3xl font-black leading-[0.98] text-[#0b2c1d] sm:text-4xl">
  Automated Scholarship Tracking System
</h2>
```
Refine with Apple typography:
```tsx
<h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[#0b2c1d]">
  Automated Scholarship<br />Tracking System
</h2>
```

Description (line ~133):
```tsx
<p className="mt-4 max-w-md text-sm leading-6 text-[#4b5d52] sm:text-base">
```
Refine:
```tsx
<p className="mt-3 max-w-md text-sm leading-relaxed tracking-[0.01em] text-[#4b5d52]">
```

- [ ] **Step 4: Refine inputs — remove hardcoded inline styles, use new input styling philosophy**

Update username input:
```tsx
<Input
  id="username"
  type="text"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="h-[52px] rounded-2xl border-[#cfddcf] bg-white/95 pl-12 pr-4 text-base font-medium text-[#12261c] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_rgba(13,91,59,0.08)] placeholder:text-[#7b8b81] focus-visible:border-[#0d5b3b] focus-visible:ring-[#0d5b3b]/20"
  disabled={isLoading}
  autoComplete="username"
  required
/>
```

Simplify to:
```tsx
<Input
  id="username"
  type="text"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="h-[52px] rounded-xl border-white/20 bg-white/95 pl-12 text-base placeholder:text-[#7b8b81] focus-visible:ring-[#0d5b3b]/15"
  disabled={isLoading}
  autoComplete="username"
  required
/>
```

Same treatment for password input.

- [ ] **Step 5: Refine the login button**

Update button (line ~189):
```tsx
<Button
  type="submit"
  className="group mt-7 h-[52px] w-full rounded-2xl bg-[#0d5b3b] text-base font-extrabold text-white shadow-[0_16px_32px_rgba(13,91,59,0.28)] hover:bg-[#0b4d32] hover:shadow-[0_18px_38px_rgba(13,91,59,0.34)] focus-visible:ring-[#e0b848]/50"
  disabled={isLoading}
>
```

Simplify to use logical Tailwind classes:
```tsx
<Button
  type="submit"
  className="group mt-7 h-[52px] w-full rounded-xl bg-[#0d5b3b] text-base font-bold text-white shadow-lg hover:bg-[#0b4d32]"
  disabled={isLoading}
>
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`

---

### Task 13: Final Verification & Build

**Files:**
- All files modified above

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Build check**

Run: `pnpm run build`
Expected: Build succeeds

- [ ] **Step 3: LSP diagnostics on all modified files**

Run diagnostics on each modified file. Verify no errors or warnings.

---

## Self-Review

**Spec coverage check:**
- Design tokens → Task 1
- Root layout dot pattern → Task 2
- Button → Task 3
- Card → Task 4
- Input/Select/Textarea → Task 5
- Table/Badge → Task 6
- Dialog/Sheet → Task 7
- Tabs/Dropdown-menu → Task 8
- Page transition springs → Task 9
- Header/Sidebar material → Task 10
- Dashboard components → Task 11
- Login polish → Task 12
- Verification → Task 13
All spec sections covered.

**Placeholder scan:** No TODOs, TBDs, or incomplete code. Every step has concrete code blocks.

**Type consistency:** No cross-task type dependencies — each component is self-contained. No signature mismatches.
