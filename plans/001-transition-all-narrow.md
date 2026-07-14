# 001 — Narrow `transition-all` to property-specific transitions

- **Status**: TODO
- **Commit**: `7b63686`
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 3 files, ~10 lines changed total

## Problem

Three high-frequency UI primitives use `transition-all`, which animates **every** CSS property when any property changes. Per the audit playbook, `transition-all` triggers layout + paint + composite for unintended properties, dropping frames on lower-end devices.

The properties that actually change on each component are very specific — all others should be excluded from the transition.

### Current code

**`src/components/ui/button.tsx:9`** — `transition-all` on button (hit tens to hundreds of times/day):

```css
/* current */
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-100 ease-out ...
```

Properties that change on button: `background-color`, `color`, `box-shadow` (on hover variants), `transform` (on `active:scale-[0.97]`), `opacity` (on disabled), `outline` (on focus-visible). Everything else (padding, gap, font-size, border-radius, etc.) is static — `transition-all` wastes GPU time on those.

**`src/components/ui/card.tsx:10`** — `transition-all` on cards (hit dozens of times per session on dashboard):

```css
/* current */
'flex flex-col gap-6 rounded-xl border-[0.5px] border-border/60 bg-card/85 p-5 shadow-sm backdrop-blur-xl saturate-[1.4] transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5',
```

Properties that change on card hover: `transform` (on `hover:-translate-y-0.5`), `box-shadow` (on `hover:shadow-md`). The 18+ other properties (gap, padding, border-radius, backdrop-filter, etc.) do not change but are included in the transition.

**`src/components/ui/tabs.tsx:37`** — `transition-all` on tab triggers (hit dozens of times per session):

```css
/* current */
"inline-flex h-10 items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/15 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-1.5px_0_hsl(var(--primary))]",
```

Properties that change on tab trigger: `color` (text color on active), `box-shadow` (active indicator underline), `opacity` (disabled). Everything else is static.

## Target

Each component transitions **only** the properties that actually change:

**Button** — transition only `color`, `background-color`, `box-shadow`, `transform`, `outline`:

```css
/* target */
... text-sm font-medium transition-[color,background-color,box-shadow,transform,outline] duration-100 ease-out ...
```

**Card** — transition only `transform` and `box-shadow`:

```css
/* target */
'... backdrop-blur-xl saturate-[1.4] transition-[transform,box-shadow] duration-300 ease-out hover:shadow-md hover:-translate-y-0.5',
```

**Tabs trigger** — transition only `color` and `box-shadow` (and `opacity` for disabled):

```css
/* target */
"inline-flex ... ring-offset-background transition-[color,box-shadow] duration-200 ease-out ... disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-1.5px_0_hsl(var(--primary))]",
```

## Repo conventions to follow

- Tailwind's `transition-[prop1,prop2]` syntax (arbitrary value) is used elsewhere in the codebase — e.g. `src/components/dashboard/program-mix-donut.tsx:73` uses inline `transition: 'transform 0.35s ..., opacity 0.3s ease'`. The Tailwind arbitrary-property syntax `transition-[transform,box-shadow]` matches the codebase's existing Tailwind v4 usage.
- No new CSS files or JS helper functions needed.
- Keep the existing `duration` and `easing` values unchanged (100ms ease-out for button, 300ms ease-out for card, 200ms ease-out for tabs) — this plan only narrows the properties list.

## Steps

1. **`src/components/ui/button.tsx:9`** — In the `buttonVariants` CVA string, replace `transition-all` with `transition-[color,background-color,box-shadow,transform,outline]`.

   Before:
   ```
   text-sm font-medium transition-all duration-100 ease-out
   ```
   After:
   ```
   text-sm font-medium transition-[color,background-color,box-shadow,transform,outline] duration-100 ease-out
   ```

2. **`src/components/ui/card.tsx:10`** — In the `Card` div className, replace `transition-all` with `transition-[transform,box-shadow]`.

   Before:
   ```
   backdrop-blur-xl saturate-[1.4] transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5
   ```
   After:
   ```
   backdrop-blur-xl saturate-[1.4] transition-[transform,box-shadow] duration-300 ease-out hover:shadow-md hover:-translate-y-0.5
   ```

3. **`src/components/ui/tabs.tsx:37`** — In the `TabsTrigger` className, replace `transition-all` with `transition-[color,box-shadow]`.

   Before:
   ```
   text-sm font-medium ring-offset-background transition-all duration-200 ease-out
   ```
   After:
   ```
   text-sm font-medium ring-offset-background transition-[color,box-shadow] duration-200 ease-out
   ```

## Boundaries

- Do NOT change any other files — this plan covers only `button.tsx`, `card.tsx`, and `tabs.tsx`.
- Do NOT change easing, duration, or any other styling — only the transition property list.
- Do NOT touch `input.tsx`, `select.tsx`, `dialog.tsx`, or any other components that also use `transition-all` — those are covered by other plans.
- Do NOT add or remove any HTML structure or JavaScript logic.
- If any file's code has drifted (different line numbers or content) since commit `7b63686`, read the current file to verify the exact string before replacing.

## Verification

- **Mechanical**: Run `pnpm run typecheck` — should complete with zero errors. Run `pnpm run lint` — should pass.
- **Visual feel check**: Start the dev server (`pnpm run dev`), open the app, and:
  - Hover over buttons on the students/scholarships pages — the background color transition should feel identical to before (100ms ease-out is unchanged).
  - Hover over cards on the dashboard — the lift and shadow should feel identical (300ms ease-out is unchanged).
  - Click between tabs on the reports page — the active underline should animate smoothly (200ms ease-out is unchanged).
- **Performance check**: In DevTools, open the "Layers" panel. Select a button, card, and tab trigger — confirm only `graphics layer` is painted (not layout).
- **Done when**: All transitions feel identical to before, typecheck passes, and lint passes. The only difference is internal — DevTools > Computed > `transition-property` should show the narrowed property list, not `all`.
