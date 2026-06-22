# ScholarTrack — Setup Guide

## Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn**

## Installation

```bash
# Install dependencies
npm install
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
npm run db:add-indexes

# Seed the database with initial data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

## Development Server

```bash
npm run dev
```

Access at: `http://localhost:8080`

## Production Build

```bash
npm run build
npm start
```

## Available Scripts

| Command                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm run dev`            | Start development server (port 8080)          |
| `npm run build`          | Generate Prisma client + production build     |
| `npm start`              | Start production server                       |
| `npm run lint`           | Run ESLint                                    |
| `npm run typecheck`      | TypeScript type checking                      |
| `npm run test`           | Run Vitest tests                              |
| `npm run test:watch`     | Run tests in watch mode                       |
| `npm run db:push`        | Push Prisma schema to database                |
| `npm run db:seed`        | Seed database with initial data               |
| `npm run db:studio`      | Open Prisma Studio                            |
| `npm run db:add-indexes` | Apply performance indexes                     |
| `npm run erd:generate`   | Generate ERD visualization                    |
| `npm run erd:view`       | Open ERD in browser                           |
| `npm run db:backup`      | Manage data backups (list, create, export)    |
| `npm run clean`          | Clean node_modules and .next, reinstall       |

## Initial Users

Set `SEED_ADMIN_PASSWORD` and `SEED_STAFF_PASSWORD` in your environment before running `npm run db:seed`. The seed scripts create admin and staff users with these credentials.

## Database Management

### View Database

```bash
# Prisma Studio
npm run db:studio

# View ERD
npm run erd:view
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
npm run db:backup -- --list                    # View recent backups
npm run db:backup -- --export-all              # Export all tables to JSON
npm run db:backup -- --create students         # Backup a specific table
npm run db:backup -- --help                    # Full usage guide
```

For detailed backup documentation, see [`scripts/README.md`](../scripts/README.md).
