# Donut Hover Arc Morph — Design Spec

**Date:** 2026-07-15
**Component:** `ProgramMixDonut` (`src/components/dashboard/program-mix-donut.tsx`)

## Problem

The Program Mix donut chart's hover interaction uses a CSS `scale(1.06)` transform and instant opacity toggle — a "blink" effect with no spatial morphing. When hovering a sector, it should visually expand its arc angle while neighbors compress, creating a smooth redistribution of the 360° ring.

## Scope

Single file change: `src/components/dashboard/program-mix-donut.tsx`.

No changes to `AnimatedChart`, the parent `DashboardOverview`, data transformers, or legend behavior.

## Behavior

### Hover enter

1. Hovered sector's arc **expands** by 4° total (2° added to each edge of its arc).
2. All other sectors **compress proportionally** to fill the remaining degrees.
3. Non-hovered sectors **dim** to `opacity 0.25` via GSAP `autoAlpha`.
4. Hovered sector's **center label** fades in (`autoAlpha 0 → 1`).
5. Hovered sector's **radius expands** (innerRadius -3, outerRadius +8) — kept as-is from current behavior.

### Hover leave

1. All angles **morph back** to resting proportions.
2. All opacities **return to 1**.
3. Center label **fades out**.

### Initial load / data change

No change — the existing `AnimatedChart` staggered reveal handles entry.

## Architecture

### Angle computation

- **Resting angles:** computed from data (`value / total × 360`), starting at 0°, accumulating clockwise.
- **Hover angles:** the hovered sector gains `EXPANSION_DEGREES` (4°). Each of the other sectors loses a proportional share of those 4° based on their resting angle. Sector order is preserved — no reordering.

### Animation mechanism

- A reactive state object holds per-sector `{ startAngle, endAngle, opacity }`.
- `onMouseEnter` / `onMouseLeave` handlers trigger `gsap.to()` tweens on this object.
- GSAP `onUpdate` calls a React state setter to trigger re-render with new angles.
- Recharts `<Pie>` and the custom `<Sector>` shape receive the animated angles directly.

### Removed

- CSS `transform: scale(1.06)` and `transition` on the `<g>` wrapper.
- CSS `opacity: 0.25` dimming (replaced by GSAP-driven opacity from the state object).

### Kept

- `AnimatedChart` entry animation (staggered sector reveal on data change).
- Center label text content and positioning.
- Interactive legend (synced hover via `activeIndex`).
- Card layout, colors, `DONUT_COLORS` palette.
- Radius expansion on hover (innerRadius -3, outerRadius +8).
- `prefers-reduced-motion` support.

## Animation Parameters

| Property        | Enter value | Leave value | Duration | Easing     |
|-----------------|-------------|-------------|----------|------------|
| Arc angles      | expanded    | resting    | 0.4s     | power2.out |
| Sector opacity  | 0.25 / 1.0  | 1.0        | 0.3s     | power2.out |
| Center label    | 0 → 1       | 1 → 0      | 0.2s     | power2.out |

**Expansion:** 4° total (2° per edge of hovered sector).

**Reduced motion:** skip GSAP tweens, show final state immediately.

## File Changes

| File | Change |
|------|--------|
| `src/components/dashboard/program-mix-donut.tsx` | Add `useGSAP`, angle computation, GSAP hover tweens, remove CSS hover transitions |
