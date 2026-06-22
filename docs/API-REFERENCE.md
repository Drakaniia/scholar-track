# ScholarTrack — API Reference

All API endpoints return JSON responses with a consistent structure. Protected routes require a valid JWT session cookie (`auth-token`).

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if unsuccessful"
}
```

Paginated endpoints also return:

```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10
}
```

---

## Authentication

### `POST /api/auth/login`

Authenticate a user and create a session.

**Auth:** None

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response:** Sets HTTP-only cookie (`auth-token`), returns user data.

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

**Errors:** `401` — invalid credentials; `423` — account locked.

### `POST /api/auth/logout`

Destroy the current session.

**Auth:** Any authenticated user

**Response:**
```json
{ "success": true, "message": "Logged out successfully" }
```

### `GET /api/auth/me`

Get the currently authenticated user.

**Auth:** Any authenticated user

**Response:**
```json
{ "success": true, "user": { ... } }
```

---

## Dashboard

### `GET /api/dashboard`

Get dashboard statistics with optional filters.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Filter by source (`INTERNAL`, `EXTERNAL`, or empty) |
| `gradeLevel` | string | Filter by grade level |

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 100,
      "studentsWithScholarships": 75,
      "totalScholarships": 20,
      "activeScholarships": 18,
      "totalAmountAwarded": 500000,
      "totalDisbursed": 300000
    },
    "recentStudents": [...],
    "charts": {
      "studentsByGradeLevel": [...],
      "scholarshipsByType": [...],
      "monthlyTrends": [...]
    }
  }
}
```

### `GET /api/dashboard/detailed`

Get detailed student data for the reports page.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Filter by scholarship source |

**Response:** Array of students with scholarships and fees.

---

## Students

### `GET /api/students`

List students with pagination and filters.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 10) |
| `search` | string | Search by name/program |
| `gradeLevel` | string | Filter by grade level |
| `program` | string | Filter by program |
| `status` | string | Filter by status |
| `scholarshipId` | string | Filter by scholarship ID (or `none` for unassigned) |
| `scholarshipSource` | string | Filter by source |
| `academicYearId` | int | Filter by academic year |
| `archived` | bool | Include archived students |
| `population` | string | `active`, `archived`, or `separated` |

**Response:** Paginated list of student records.

### `POST /api/students`

Create one or more students.

**Auth:** ADMIN, STAFF

**Request Body (single):**
```json
{
  "lastName": "string (required)",
  "firstName": "string (required)",
  "middleInitial": "string",
  "program": "string (required)",
  "gradeLevel": "GRADE_SCHOOL | JUNIOR_HIGH | SENIOR_HIGH | COLLEGE",
  "yearLevel": "string (required)",
  "status": "Active",
  "birthDate": "2024-01-01",
  "termType": "SEMESTER | TRIMESTER",
  "scholarships": [
    {
      "scholarshipId": 1,
      "academicYearId": 1,
      "grantAmount": 15000,
      "grantType": "FULL"
    }
  ],
  "fees": {
    "tuitionFee": 11000,
    "miscellaneousFee": 2000,
    "academicYearId": 1
  }
}
```

**Request Body (batch):**
```json
{
  "students": [ ... ]
}
```

**Response:** Created student(s) with relations.

### `GET /api/students/[id]`

Get a single student with scholarships, fees, and disbursements.

**Auth:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "scholarships": [...],
    "fees": [...],
    "disbursements": [...]
  }
}
```

### `PUT /api/students/[id]`

Update a student record.

**Auth:** ADMIN, STAFF

**Request Body:** Partial student fields + scholarships array + fees object.

**Response:** Updated student with relations.

### `PATCH /api/students/[id]`

Archive or unarchive a student.

**Auth:** ADMIN only

**Request Body:**
```json
{ "action": "archive | unarchive" }
```

### `DELETE /api/students/[id]`

Soft-delete (archive) a student.

**Auth:** ADMIN only

### `GET /api/students/filter-options`

Get filter options with aggregated counts.

**Auth:** Any authenticated user

**Query Parameters:** Same as `GET /api/students`.

**Response:**
```json
{
  "data": {
    "programs": ["Grade 1", "Grade 2", ...],
    "programCounts": { "Grade 1": 10, ... },
    "gradeLevelCounts": { "COLLEGE": 50, ... },
    "statusCounts": { "Active": 100, ... },
    "scholarships": [...],
    "studentsWithoutScholarship": 25,
    "total": 100
  }
}
```

### `GET /api/students/initial-data`

Combined endpoint for initial page load data.

**Auth:** Any authenticated user

**Response:**
```json
{
  "data": {
    "programs": [...],
    "programCounts": {...},
    "scholarships": [...],
    "totalStudents": 100,
    "studentsWithScholarships": 75,
    "studentsWithoutScholarship": 25
  }
}
```

### `GET /api/students/[id]/fees`

Get all fee records for a student.

**Auth:** Any authenticated user

### `POST /api/students/[id]/fees`

Create or update student fees.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "tuitionFee": 11000,
  "miscellaneousFee": 2000,
  "laboratoryFee": 1500,
  "otherFee": 500,
  "amountSubsidy": 7500,
  "term": "1st Semester",
  "academicYear": "2025-2026",
  "academicYearId": 1
}
```

### `DELETE /api/students/[id]/fees`

Delete student fees for a specific term/year.

**Auth:** ADMIN only

**Query Parameters:** `term`, `academicYear` (required).

### `GET /api/students/[id]/scholarships`

Get all scholarship assignments for a student.

**Auth:** Any authenticated user

### `POST /api/students/[id]/scholarships`

Assign a scholarship to a student.

**Auth:** ADMIN, STAFF

**Request Body:**
```json
{
  "scholarshipId": 1,
  "academicYearId": 1,
  "awardDate": "2024-06-01",
  "grantAmount": 15000,
  "grantType": "FULL",
  "scholarshipStatus": "Active"
}
```

### `POST /api/students/bulk-archive`

Bulk archive/unarchive students by IDs or filters.

**Auth:** ADMIN only

**Request Body (by IDs):**
```json
{
  "action": "archive | unarchive",
  "studentIds": [1, 2, 3]
}
```

**Request Body (select all):**
```json
{
  "action": "archive",
  "selectAll": true,
  "filters": { "gradeLevel": "COLLEGE" }
}
```

### `DELETE /api/students/[id]/scholarships/[scholarshipId]`

Remove a specific scholarship assignment from a student.

**Auth:** ADMIN, STAFF

### `POST /api/students/permanent-delete`

Permanently delete archived students.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

---

## Scholarships

### `GET /api/scholarships`

List scholarships with pagination and filters.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `action` | string | `counts` for aggregated counts |
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 10) |
| `search` | string | Search by name/sponsor |
| `type` | string | Filter by type |
| `source` | string | Filter by source |
| `status` | string | Filter by status |
| `academicYearId` | string | Filter by academic year |
| `eligibleGradeLevels` | string | Filter by eligible levels |
| `archived` | bool | Include archived |

**Response:** Paginated list with `_count.students`.

### `POST /api/scholarships`

Create a new scholarship.

**Auth:** ADMIN, STAFF

**Request Body:**
```json
{
  "scholarshipName": "string (required)",
  "sponsor": "string (required)",
  "type": "string (required)",
  "source": "INTERNAL | EXTERNAL",
  "eligibleGradeLevels": "GRADE_SCHOOL,JUNIOR_HIGH,SENIOR_HIGH,COLLEGE",
  "eligiblePrograms": "string",
  "amount": 50000,
  "requirements": "string",
  "status": "Active",
  "grantType": "FULL | TUITION_ONLY | MISC_ONLY | LAB_ONLY | NONE",
  "coversTuition": true,
  "coversMiscellaneous": false,
  "coversLaboratory": false,
  "coversOther": false,
  "tuitionFee": 0,
  "miscellaneousFee": 0,
  "laboratoryFee": 0,
  "otherFee": 0,
  "amountSubsidy": 0,
  "academicYearId": 1,
  "coveredTerms": "1ST,2ND"
}
```

### `GET /api/scholarships/[id]`

Get a single scholarship with students and disbursements.

**Auth:** Any authenticated user

### `PUT /api/scholarships/[id]`

Update a scholarship. Supports syncing subsidy changes to student fees.

**Auth:** ADMIN, STAFF

**Request Body:** Partial scholarship fields.

### `PATCH /api/scholarships/[id]`

Archive or unarchive a scholarship.

**Auth:** ADMIN only

**Request Body:**
```json
{ "action": "archive | unarchive" }
```

### `DELETE /api/scholarships/[id]`

Soft-delete (archive) a scholarship.

**Auth:** ADMIN only

### `GET /api/scholarships/filter-options`

Get scholarship filter options with source counts.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Filter by source |
| `academicYearId` | string | Filter by academic year |

**Response:**
```json
{
  "data": { "total": 20, "internal": 12, "external": 8 }
}
```

### `GET /api/scholarships/flow`

Get five-year comparative scholarship data.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `source` | string | `all`, `INTERNAL`, or `EXTERNAL` |
| `gradeLevel` | string | Filter by grade level |
| `endYear` | int | End year for the 5-year window |

**Response:**
```json
{
  "data": {
    "years": [ ... ],
    "summary": {
      "startYear": 2021,
      "endYear": 2025,
      "totalAwarded": 500000,
      "totalDisbursed": 300000,
      "totalBeneficiaries": 50,
      "activeStudents": 100,
      "multiScholarshipStudents": 10
    },
    "loadDistribution": [ ... ],
    "multiScholarshipStudents": [ ... ],
    "topTypes": [ ... ],
    "topScholarships": [ ... ]
  }
}
```

### `POST /api/scholarships/permanent-delete`

Permanently delete archived scholarships.

**Auth:** ADMIN only

**Request Body:**
```json
{ "ids": [1, 2, 3] }
```

---

## Academic Years

### `GET /api/academic-years`

List academic years with pagination.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `action` | string | `active` to get active year only |
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 10) |

### `POST /api/academic-years`

Create a new academic year.

**Auth:** ADMIN, STAFF

**Request Body:**
```json
{
  "year": "2025-2026",
  "startDate": "2025-06-01",
  "endDate": "2026-03-31",
  "semester": "1ST | 2ND | 3RD",
  "isActive": true,
  "promotionDate": "2025-06-01"
}
```

### `PUT /api/academic-years`

Update an academic year. Uses `?id=` query param.

**Auth:** ADMIN, STAFF

**Query Parameters:** `id` (required).

**Request Body:** Partial academic year fields.

### `DELETE /api/academic-years`

Delete an academic year (only if not in use). Uses `?id=` query param.

**Auth:** ADMIN, STAFF

### `GET /api/academic-years/auto-promote`

Get promotion preview with student transition recommendations.

**Auth:** Any authenticated user

### `POST /api/academic-years/auto-promote`

Trigger all-student promotion (currently disabled — use bulk promotion instead).

**Auth:** ADMIN only

### `PATCH /api/academic-years/auto-promote`

Save transition decisions for students.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "decisions": [
    { "studentId": 1, "decision": "CONTINUE" },
    { "studentId": 2, "decision": "ARCHIVE" }
  ]
}
```

### `DELETE /api/academic-years/auto-promote`

Undo the last promotion run.

**Auth:** ADMIN only

### `POST /api/academic-years/auto-promote/bulk`

Bulk promote selected students with optional transition decisions.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "studentIds": [1, 2, 3],
  "cohortStudentIds": [1, 2, 3, 4, 5],
  "transitionDecisions": [
    { "studentId": 4, "decision": "CONTINUE" },
    { "studentId": 5, "decision": "ARCHIVE" }
  ]
}
```

---

## Exports

### `GET /api/export/students`

Export detailed student scholarship report.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `format` | string | `xlsx`, `pdf`, or `csv` (default `xlsx`) |
| `source` | string | Filter by source (`INTERNAL`, `EXTERNAL`) |

**Response:** Binary file download.

### `GET /api/export/summary`

Export scholarship summary by grade level (XLSX only).

**Auth:** Any authenticated user

**Query Parameters:** `format=xlsx` (required).

**Response:** Binary Excel workbook with per-grade-level sheets.

### `GET /api/export/scholarships`

Export all scholarship programs.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `format` | string | `xlsx`, `pdf`, or `csv` (default `pdf`) |

**Response:** Binary file download.

---

## Disbursements

### `GET /api/disbursements/check-eligibility`

Check if a student is eligible for disbursement.

**Auth:** ADMIN, STAFF

**Query Parameters:** `studentId` (required).

**Response:**
```json
{
  "data": { "studentId": 1, "isEligible": true }
}
```

---

## Users (Admin Only)

### `GET /api/users`

List all users with pagination and filters.

**Auth:** ADMIN only

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 25) |
| `search` | string | Search by username/email/name |
| `role` | string | Filter by role |
| `status` | string | Filter by status |

### `POST /api/users`

Create a new user.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "username": "string (min 3 chars)",
  "email": "valid email",
  "password": "string (min 8 chars)",
  "firstName": "string",
  "lastName": "string",
  "role": "ADMIN | STAFF | VIEWER",
  "status": "ACTIVE | INACTIVE | SUSPENDED"
}
```

### `PUT /api/users/[id]`

Update a user.

**Auth:** ADMIN only

**Request Body:** Partial user fields.

### `DELETE /api/users/[id]`

Delete a user. Cannot delete self or last admin.

**Auth:** ADMIN only

### `POST /api/users/[id]/reset-password`

Reset a user's password.

**Auth:** ADMIN only

**Request Body:**
```json
{
  "newPassword": "string (min 8 chars)"
}
```

---

## Audit Logs (Admin Only)

### `GET /api/audit-logs`

List audit logs with pagination and filters.

**Auth:** ADMIN only

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 50) |
| `action` | string | Filter by action |
| `resourceType` | string | Filter by resource type |
| `userId` | int | Filter by user |
| `startDate` | string | Filter by date range start |
| `endDate` | string | Filter by date range end |

### `GET /api/audit-logs/filter-options`

Get unique audit log filter values.

**Auth:** ADMIN only

---

## Registry / Promotion Level

### `GET /api/registry`

Get year-end transition registry with separated students.

**Auth:** Any authenticated user

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 20, max 100) |
| `search` | string | Search by name/program |
| `lane` | string | `all`, `grade-school-to-jhs`, `jhs-to-shs`, `shs-to-college`, `separated` |
| `status` | string | Filter by status |
| `yearLevel` | string | Filter by year level |

---

## Graduation

### `POST /api/graduation`

Process graduating students and remove scholarships.

**Auth:** ADMIN only

---

## Profile

### `GET /api/profile`

Get current user's profile.

**Auth:** Any authenticated user

### `PUT /api/profile`

Update own profile.

**Auth:** Any authenticated user

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "valid email"
}
```

### `POST /api/profile/change-password`

Change own password.

**Auth:** Any authenticated user

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8 chars)"
}
```

---

## Sessions

### `GET /api/sessions`

List all active sessions.

**Auth:** ADMIN only

### `DELETE /api/sessions/[id]`

Revoke / terminate a specific session.

**Auth:** ADMIN only

---

## Scheduler

### `POST /api/scheduler/start`

Start the automated scheduler.

**Auth:** ADMIN only

---

## Cron Jobs

### `GET /api/cron/auto-promote`

Scheduled auto-promotion endpoint (currently disabled). Requires `Authorization: Bearer <CRON_SECRET>` header.

---

## Debug

### `GET /api/debug/db`

Database connection diagnostic (no auth required).

**Response:**
```json
{
  "env": { "databaseUrl": true, "jwtSecret": true, ... },
  "database": { "status": "connected", "error": null },
  "users": { "count": 5, "error": null }
}
```

---

## Common Response Patterns

### Success
```json
{ "success": true, "data": { ... } }
```

### Paginated Success
```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Error
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [ { "path": ["field"], "message": "Required" } ]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / validation error |
| `401` | Not authenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Not found |
| `409` | Conflict (duplicate) |
| `423` | Account locked |
| `500` | Internal server error |
