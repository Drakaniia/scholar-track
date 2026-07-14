# Animation Improvement Plans

Plans for improving animation and motion quality across the ScholarTrack codebase.

| # | Title | Severity | Category | Status |
|---|---|---|---|---|
| 001 | Narrow `transition-all` to property-specific transitions | HIGH | Performance | **DONE** |
| — | Shared easing/duration tokens (H2) | HIGH | Cohesion & tokens | Pending user selection |
| — | Keyframes interruptibility on line-hover-link (H3) | HIGH | Interruptibility | Pending user selection |
| — | Sheet open duration 500ms (M1) | MEDIUM | Easing & duration | Pending user selection |
| — | Card hover lift duration 300ms (M2) | MEDIUM | Easing & duration | Pending user selection |
| — | Reduced-motion gating on Radix wrappers (M3) | MEDIUM | Accessibility | Pending user selection |

## Recommended execution order

1. **001** — `transition-all` narrow (zero risk, immediate performance gain)
2. Shared easing/duration tokens — foundational; unblocks other easing fixes
3. Card hover lift duration (depends on H2 for token usage)
4. Sheet open duration (depends on H2 for token usage)
5. Keyframes interruptibility (independent)
6. Reduced-motion gating (independent)

## Dependencies

- H2 (easing/duration tokens) is a dependency for M1 and M2 if using the new tokens.
- All other plans are independent and can be executed in any order.
