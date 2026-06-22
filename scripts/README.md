# Scripts

Utility scripts for the ScholarTrack scholarship management system.

## Available Scripts

### `add-indexes.ts`
Creates database indexes to optimize query performance for common access patterns.

```bash
npm run db:add-indexes
```

### `backup-data.ts`
CLI tool to create, export, and restore data backups. Supports listing recent backups, creating table-level database backup records, exporting all/selected tables to local JSON files, and restoring from JSON exports with dry-run preview.

```bash
npm run db:backup -- --list                                     # Show recent backups (last 20)
npm run db:backup -- --list --limit 10                          # Show last 10 backups
npm run db:backup -- --create students                          # Backup all student records in DB
npm run db:backup -- --export-all                               # Export all tables to local JSON files
npm run db:backup -- --export-all --tables students,scholarships  # Export only specific tables
npm run db:backup -- --restore backups/backup-<timestamp>        # Restore from JSON files
npm run db:backup -- --restore backups/backup-<timestamp> --dry-run  # Preview restore without writing
npm run db:backup -- --restore backups/backup-<timestamp> --tables students  # Restore only specific tables
npm run db:backup -- --help                                     # Show full usage
```

The `--export-all` flag exports all valid tables (`students`, `scholarships`, `disbursements`, `student_scholarships`, `student_fees`, `academic_years`) to timestamped JSON files in the `backups/` directory. Each export creates a folder with individual table JSON files and a `manifest.json` containing metadata. Use `--tables` to export only specific tables.

The `--restore <backup-dir>` flag imports data from a previously exported backup directory back into the database. It restores tables in dependency order (academic years → students → scholarships → student scholarships → student fees → disbursements) using Prisma upsert, so existing records are updated and new records are inserted. Date fields are automatically deserialized and records are restored with their original IDs.

- `--dry-run`: Preview what would be restored without writing any data to the database.
- `--tables <names>`: Comma-separated list of tables to export or restore (e.g. `students,scholarships`).

### `delete-student-data.ts`
Deletes all student-related data while preserving scholarship definitions. Supports dry-run mode for preview.

```bash
npm run db:reset-students                      # Preview counts (dry run)
npm run db:reset-students -- --confirm         # Permanently delete student data
```

### `diagnose-academic-year-issue.ts`
Diagnostic tool for investigating academic year-related data issues in the database.

```bash
npm run tsx scripts/diagnose-academic-year-issue.ts
```

### `fix-paeb-data.ts`
Utility to fix PAEB (Program of Assistance for Education and Bar) scholarship data discrepancies.

```bash
npm run tsx scripts/fix-paeb-data.ts
```

### `test-scholarship-api.ts`
Integration test script that makes real HTTP requests against the running API server.

**Prerequisites:** Development server must be running (`npm run dev`), and `TEST_ADMIN_PASSWORD` must be set.

```bash
npm run test:api
```

Covers: authentication flow, full CRUD for scholarships, partial updates, archive/unarchive, and authorization enforcement.

## Running Scripts

Most scripts can be run via their `npm run` alias (see `package.json`). For scripts without a dedicated alias:

```bash
npx tsx scripts/<script-name>.ts
```

## Test Files

- `tests/backup-data.test.ts` — Unit tests for the backup data script
- `tests/delete-student-data-script.test.ts` — Unit tests for the delete student data script

Run all tests:

```bash
npm run test
```

For more details on test scripts, see [`TESTS.md`](./TESTS.md).
