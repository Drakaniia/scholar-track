# Per-Student Grant Amount Editing — Specification

> **Status:** Draft  
> **Date:** 2026-07-16

---

## 1. Summary of the Problem

The system already supports per-student grant amounts at the database level:

| Table                | Field         | Purpose                                                         |
| -------------------- | ------------- | --------------------------------------------------------------- |
| `Scholarship`        | `amount`      | Default grant amount for new assignments                        |
| `StudentScholarship` | `grantAmount` | Actual per-student grant amount (overrides scholarship default) |

When a scholarship is assigned to a student, the `grantAmount` on the junction table is initialized from the scholarship's `amount`, but can be different for each student. **Changing one student's `grantAmount` does NOT affect any other student.**

The problem is purely a **UI gap**: the scholarship detail page shows assigned students but their `grantAmount` is **read-only**. Users need to be able to edit each student's grant amount directly from the scholarship detail page.

---

## 2. What Already Works (No Changes Needed)

✅ **Database**: `StudentScholarship.grantAmount` field exists  
✅ **Student form**: Grant amount is already editable when assigning a scholarship  
✅ **API**: POST/PUT student-endpoints already pass `grantAmount` through  
✅ **Reports**: They already aggregate from actual `grantAmount` values  
✅ **Isolation**: Updating one student's amount does not affect others (already handled by the junction table design)

---

## 3. What Needs to Change

### 3.1 Scholarship Detail Page — Make Grant Amount Editable

**File:** `src/app/(dashboard)/scholarships/page.tsx`

Currently, the assigned students section shows a read-only list:

```
Student Name       | Grant Amount
Juan Dela Cruz     | ₱10,000
Maria Santos       | ₱7,000
```

Change it to allow inline editing:

```
Student Name       | Grant Amount          | Actions
Juan Dela Cruz     | [₱10,000    ] [✓]     | Loading... or Saved!
Maria Santos       | [₱7,000     ] [✓]     | Loading... or Saved!
```

**UX pattern:**

- Grant amount is displayed as an always-editable currency input
- A "Save" button appears next to each row
- Clicking "Save" persists just that student's new grant amount via API
- Show a loading spinner while saving, then "Saved!" confirmation
- No need for an "edit mode" toggle — keep it simple

### 3.2 New API Endpoint for Single-Student Grant Amount Update

**PATCH** `/api/scholarships/[scholarshipId]/students/[studentScholarshipId]`

Creates a lightweight endpoint that only updates `grantAmount` (and optionally `grantType` or `scholarshipStatus`) on a single `StudentScholarship` record.

Request:

```json
{
  "grantAmount": 12000
}
```

Response:

```json
{
  "success": true,
  "data": { ... updated StudentScholarship ... }
}
```

**Why a new endpoint instead of reusing PUT /api/students/[id]?**

- The student PUT endpoint does a full replacement of all scholarships (delete + createMany), which is heavy and resets other fields
- This endpoint is lightweight — just updates a single junction record
- Better UX: instant save, no full page reload

### 3.3 Cache Invalidation

After updating a student's grant amount:

- Invalidate `students-list` (student data changed)
- Invalidate `scholarships-list` (scholarship's student data changed)
- Invalidate dashboard aggregates

---

## 4. Scope of Work (Simplified)

| #   | Task                                                    | Files                                                                                          | Complexity |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| 1   | Add PATCH endpoint for single StudentScholarship update | `src/app/api/scholarships/[scholarshipId]/students/[studentScholarshipId]/route.ts` (new file) | Medium     |
| 2   | Make grant amount editable in scholarship detail dialog | `src/app/(dashboard)/scholarships/page.tsx`                                                    | Medium     |
| 3   | Wire up save functionality with loading/success states  | Same file as #2                                                                                | Low        |

---

## 5. What This Does NOT Include

❌ New scholarship types  
❌ New database fields  
❌ New columns in CSV import/export  
❌ Changes to the student form  
❌ Changes to reports or exports  
❌ Changes to `Scholarship` model or form  
❌ Changes to types other than optionally adding the endpoint type  
❌ Individual sponsor tracking

---

## 6. Edge Cases

| Scenario                                            | Behavior                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| User enters 0 or negative amount                    | Show validation error, don't save                                                                 |
| User enters a very large number                     | Saved as-is (no cap)                                                                              |
| Scholarship grant type is TUITION_ONLY or NONE      | Grant amount should remain 0 and input should be disabled (already handled in student form logic) |
| Network error during save                           | Show error toast, keep the input value so user can retry                                          |
| Two users edit same student's amount simultaneously | Last write wins (simple approach, no conflict detection needed for MVP)                           |
| Student is archived                                 | Show a disabled state — cannot edit grant amount of archived students                             |

---

## 7. Open Questions

1. Should the grant amount input be **always editable** (inline input visible at all times) or **click-to-edit** (shows text, click pencil to edit)?
2. Should we allow editing other fields from the scholarship detail page too (e.g., `scholarshipStatus` or `grantType`), or just `grantAmount`?
3. Should there be a **bulk edit** mode to set the same amount for multiple students at once?
