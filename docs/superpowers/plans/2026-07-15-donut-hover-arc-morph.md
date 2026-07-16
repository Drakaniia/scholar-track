# Donut Hover Arc Morph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- []`) syntax for tracking.

**Goal:** Replace the CSS scale/dim hover effect on the Program Mix donut chart with GSAP-driven arc angle morphing — hovered sector expands, neighbors compress proportionally.

**Architecture:** Compute resting angles from data. On hover, tween a reactive angle state object via GSAP that expands the hovered sector by 4° and compresses others. Pass animated angles to Recharts `<Sector>` via a custom `shape` function. Replace CSS transitions with GSAP tweens.

**Tech Stack:** React 19, GSAP (`useGSAP`), Recharts (`PieChart`, `Pie`, `Sector`, `Cell`, `ResponsiveContainer`), TypeScript

## Global Constraints

- Single file change: `src/components/dashboard/program-mix-donut.tsx`
- Easing: `power2.out` (match existing chart animations)
- `prefers-reduced-motion`: skip GSAP tweens, show final state immediately
- Keep `AnimatedChart` entry animation, legend behavior, radius expansion on hover, center label content/positioning, `DONUT_COLORS` palette
- Expansion: 4° total (2° per edge of hovered sector)
- Dim opacity for non-hovered sectors: 0.25

---

### Task 1: Add angle computation helpers and GSAP hover morph

**Files:**

- Modify: `src/components/dashboard/program-mix-donut.tsx`

**Interfaces:**

- Consumes: `ScholarshipTypeDatum[]` (from `./dashboard-types`), `AnimatedChart` (from `@/components/shared`), `useGSAP` (from `@gsap/react`), `gsap` (from `gsap`)
- Produces: Updated `ProgramMixDonut` component with GSAP-driven arc morph on hover

- [ ] **Step 1: Add imports and constants**

Add `useGSAP` and `gsap` imports at the top of the file. Add an `EXPANSION_DEGREES` constant.

```tsx
// Add these imports alongside existing ones
import { useCallback, useMemo, useRef, useState } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Add this constant after DONUT_COLORS
const EXPANSION_DEGREES = 4;
```

Remove the `useCallback` import from the destructuring if it was the only import from React — actually keep it since it's still used. Just add `useMemo`, `useRef` to the React import.

- [ ] **Step 2: Add angle computation types and helper**

Add a `SectorAngles` type and two helper functions: one for computing resting angles from data, one for computing hover-expanded angles. Place these after the `totalStudents` function and before the component.

```tsx
interface SectorAngles {
  startAngle: number;
  endAngle: number;
  opacity: number;
}

interface SectorAnimationState {
  sectors: SectorAngles[];
}

function computeRestingAngles(data: readonly ScholarshipTypeDatum[]): SectorAngles[] {
  const total = totalStudents(data);
  if (total === 0) return [];

  return data.map((item) => {
    const angle = (item.value / total) * 360;
    return { startAngle: 0, endAngle: angle, opacity: 1 };
  });
}

function computeAccumulatedAngles(sectors: SectorAngles[]): SectorAngles[] {
  let cursor = 0;
  return sectors.map((sector) => {
    const startAngle = cursor;
    cursor += sector.endAngle - sector.startAngle;
    return { ...sector, startAngle, endAngle: cursor };
  });
}

function computeHoverAngles(restingAngles: SectorAngles[], hoveredIndex: number): SectorAngles[] {
  const expanded: SectorAngles[] = restingAngles.map((s, i) => ({
    ...s,
    startAngle: s.startAngle,
    endAngle: s.endAngle,
    opacity: i === hoveredIndex ? 1 : 0.25,
  }));

  // Calculate the hovered sector's original arc span
  const hoveredSpan = expanded[hoveredIndex].endAngle - expanded[hoveredIndex].startAngle;

  // Redistribute: hovered sector gains EXPANSION_DEGREES, others shrink proportionally
  const remainingDegrees = 360 - hoveredSpan - EXPANSION_DEGREES;
  const otherTotalSpan = expanded.reduce(
    (sum, s, i) => (i === hoveredIndex ? sum : sum + (s.endAngle - s.startAngle)),
    0
  );

  if (otherTotalSpan === 0) return expanded;

  let cursor = 0;
  return expanded.map((s, i) => {
    const originalSpan = restingAngles[i].endAngle - restingAngles[i].startAngle;
    const span =
      i === hoveredIndex
        ? hoveredSpan + EXPANSION_DEGREES
        : (originalSpan / otherTotalSpan) * remainingDegrees;

    const startAngle = cursor;
    cursor += span;
    return { ...s, startAngle, endAngle: cursor };
  });
}
```

- [ ] **Step 3: Add reactive angle state and GSAP tweens to the component**

Inside the `ProgramMixDonut` component, after the existing `const isAnyActive = activeIndex >= 0;` line, add:

```tsx
const animStateRef = useRef<SectorAnimationState>({ sectors: [] });
const [, forceRender] = useState(0);

// Compute resting angles (memoized on data)
const restingAngles = useMemo(() => {
  const raw = computeRestingAngles(data);
  return computeAccumulatedAngles(raw);
}, [data]);

// Sync resting angles into the mutable ref when data changes
useGSAP(
  () => {
    const state = animStateRef.current;
    const target = computeAccumulatedAngles(computeRestingAngles(data));

    // If state is empty (first mount), snap to resting
    if (state.sectors.length !== target.length) {
      state.sectors = target.map((s) => ({ ...s }));
      forceRender((n) => n + 1);
    }
  },
  { dependencies: [data], scope: animStateRef }
);

// Animate hover / leave
const animateToHover = useCallback(
  (index: number) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Show final state immediately
      const target = computeHoverAngles(restingAngles, index);
      animStateRef.current.sectors = target.map((s) => ({ ...s }));
      forceRender((n) => n + 1);
      return;
    }

    const target = computeHoverAngles(restingAngles, index);
    const state = animStateRef.current;

    gsap.to(state.sectors, {
      startAngle: (i) => target[i].startAngle,
      endAngle: (i) => target[i].endAngle,
      opacity: (i) => target[i].opacity,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => forceRender((n) => n + 1),
    });
  },
  [restingAngles]
);

const animateToRest = useCallback(() => {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const target = restingAngles;
    animStateRef.current.sectors = target.map((s) => ({ ...s }));
    forceRender((n) => n + 1);
    return;
  }

  const state = animStateRef.current;

  gsap.to(state.sectors, {
    startAngle: (i) => restingAngles[i].startAngle,
    endAngle: (i) => restingAngles[i].endAngle,
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out',
    onUpdate: () => forceRender((n) => n + 1),
  });
}, [restingAngles]);
```

- [ ] **Step 4: Update renderCustomShape to use animated angles and remove CSS transitions**

Replace the entire `renderCustomShape` callback. Key changes:

- Read angles from `animStateRef.current.sectors[index]` instead of Recharts props
- Remove the CSS `transform: scale(1.06)` and `transition` on the `<g>` wrapper
- Keep the radius expansion (`innerRadius - 3`, `outerRadius + 8`) on the hovered sector
- Keep the center label fade-in (convert to use the animated opacity from state)

```tsx
const renderCustomShape = useCallback(
  (props: PieSectorShapeProps) => {
    const {
      cx,
      cy,
      innerRadius = 0,
      outerRadius = 0,
      fill = '#94a3b8',
      payload,
      value = 0,
      index,
    } = props;

    const animated = animStateRef.current.sectors[index];
    const startAngle = animated?.startAngle ?? props.startAngle;
    const endAngle = animated?.endAngle ?? props.endAngle;
    const sectorOpacity = animated?.opacity ?? 1;
    const isThisActive = index === activeIndex;
    const name = payload?.name ?? '';
    const centerLabel = name ? CENTER_LABELS[name] : undefined;

    return (
      <g
        style={{ opacity: sectorOpacity }}
        onMouseEnter={() => {
          setActiveIndex(index);
          animateToHover(index);
        }}
        onMouseLeave={() => {
          setActiveIndex(-1);
          animateToRest();
        }}
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={isThisActive ? innerRadius - 3 : innerRadius}
          outerRadius={isThisActive ? outerRadius + 8 : outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontSize={15}
          fontWeight={700}
          fontFamily="var(--font-sans, system-ui)"
          style={{
            opacity: isThisActive ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          {centerLabel ?? name}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={11}
          fontFamily="var(--font-sans, system-ui)"
          style={{
            opacity: isThisActive ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          {value} student{value !== 1 ? 's' : ''}
        </text>
      </g>
    );
  },
  [activeIndex, animateToHover, animateToRest]
);
```

- [ ] **Step 5: Update legend hover handlers to trigger GSAP morph**

In the legend section (the `.flex-wrap` div with `data.map`), replace the `onMouseEnter` and `onMouseLeave` handlers:

Change:

```tsx
onMouseEnter={() => setActiveIndex(index)}
onMouseLeave={() => setActiveIndex(-1)}
```

To:

```tsx
onMouseEnter={() => {
  setActiveIndex(index);
  animateToHover(index);
}}
onMouseLeave={() => {
  setActiveIndex(-1);
  animateToRest();
}}
```

- [ ] **Step 6: Remove now-unused imports and handlers**

- Remove the `handleSectorEnter` and `handleSectorLeave` callbacks (lines 44-45) since hover is now handled inside `renderCustomShape`.
- Verify that `useCallback` is still needed (it is — `renderCustomShape`, `animateToHover`, `animateToRest` use it).
- Remove the `isAnyActive` variable (line 42) if it's no longer referenced — check first. It may still be used in the legend dimming logic. Keep it if the legend still references it.

- [ ] **Step 7: Verify the build compiles**

Run: `pnpm run typecheck`
Expected: No errors.

- [ ] **Step 8: Visual smoke test**

Run: `pnpm run dev`
Open `http://localhost:8080` → navigate to the dashboard with the Program Mix donut card.

- Hover each sector — it should smoothly expand its arc angle while others compress and dim.
- Move to a different sector — arcs should smoothly redistribute.
- Leave the donut — arcs should smoothly return to resting proportions.
- Check that the `AnimatedChart` entry animation still plays on data change.
- Verify the interactive legend still syncs hover state with the donut.

- [ ] **Step 9: Commit**

```bash
git add src/components/dashboard/program-mix-donut.tsx
git commit -m "feat(dashboard): replace CSS donut hover with GSAP arc morph animation"
```
