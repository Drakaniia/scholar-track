# ScholarTrack — Setup Guide

## Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **pnpm**, **npm**, or **yarn**

## Installation

```bash
# Install dependencies
pnpm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="prisma+postgres://user:password@host:port/db?connection_limit=10&pool_timeout=20&connect_timeout=10"
JWT_SECRET="your-secure-secret-key-min-32-characters"
SESSION_SECRET="your-session-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
SESSION_DURATION_HOURS=8
SEED_ADMIN_PASSWORD="set-a-unique-admin-password"
SEED_STAFF_PASSWORD="set-a-unique-staff-password"
```

## Database Setup

```bash
# Generate Prisma client and push schema
npx prisma db push

# Apply performance indexes
pnpm run db:add-indexes

# Seed the database with initial data
pnpm run db:seed

# (Optional) Open Prisma Studio
pnpm run db:studio
```

## Development Server

```bash
pnpm run dev
```

Access at: `http://localhost:8080`

## Production Build

```bash
pnpm run build
pnpm start
```

## Available Scripts

| Command                   | Description                                |
| ------------------------- | ------------------------------------------ |
| `pnpm run dev`            | Start development server (port 8080)       |
| `pnpm run build`          | Generate Prisma client + production build  |
| `pnpm start`              | Start production server                    |
| `pnpm run lint`           | Run ESLint                                 |
| `pnpm run typecheck`      | TypeScript type checking                   |
| `pnpm run test`           | Run Vitest tests                           |
| `pnpm run test:watch`     | Run tests in watch mode                    |
| `pnpm run db:push`        | Push Prisma schema to database             |
| `pnpm run db:seed`        | Seed database with initial data            |
| `pnpm run db:studio`      | Open Prisma Studio                         |
| `pnpm run db:add-indexes` | Apply performance indexes                  |
| `pnpm run erd:generate`   | Generate ERD visualization                 |
| `pnpm run erd:view`       | Open ERD in browser                        |
| `pnpm run db:backup`      | Manage data backups (list, create, export) |
| `pnpm run clean`          | Clean node_modules and .next, reinstall    |

## Initial Users

Set `SEED_ADMIN_PASSWORD` and `SEED_STAFF_PASSWORD` in your environment before running `pnpm run db:seed`. The seed scripts create admin and staff users with these credentials.

## Database Management

### View Database

```bash
# Prisma Studio
pnpm run db:studio

# View ERD
pnpm run erd:view
```

### Database Migration

```bash
# Development
npx prisma db push

# Production
npx prisma migrate dev --name [migration_name]
```

### Data Backup

```bash
pnpm run db:backup -- --list                    # View recent backups
pnpm run db:backup -- --export-all              # Export all tables to JSON
pnpm run db:backup -- --create students         # Backup a specific table
pnpm run db:backup -- --help                    # Full usage guide
```

For detailed backup documentation, see [`scripts/README.md`](../scripts/README.md).
