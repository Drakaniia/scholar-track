# ScholarTrack — Documentation

Welcome to the ScholarTrack documentation. This directory contains all comprehensive documentation for the scholarship tracking system.

## 📖 Quick Reference

| Document                                         | Description                                  |
| ------------------------------------------------ | -------------------------------------------- |
| [Setup Guide](./SETUP.md)                        | Installation, environment, scripts           |
| [Technical Reference](./TECHNICAL-REFERENCE.md)  | Architecture, tech stack, DB schema, RBAC    |
| [API Reference](./API-REFERENCE.md)              | Complete endpoint listing with request/response schemas |
| [Architecture Diagram](../ARCHITECTURE.md)       | System architecture with ASCII diagrams      |
| [Annual Fee Aggregation Guide](./ANNUAL-FEE-AGGREGATION-GUIDE.md) | Multi-semester fee aggregation |
| [Feature Location Guide](./WHERE-TO-FIND-NEW-FEATURES.md) | Where to find UI changes           |

## 🗺️ Entity Relationship Diagram

- [ERD SVG](./ERD.svg) — Database schema visualization
- [Interactive Viewer](./index.html) — Zoomable ERD with controls

### Viewing the ERD

```bash
npm run erd:view      # Open ERD in browser
npm run erd:generate  # Regenerate from Prisma schema
```

Available ERD themes (configurable in `prisma/schema.prisma`): `default`, `forest`, `dark`, `neutral`.

## 📂 Scripts & Tests

| Location                               | Description                  |
| -------------------------------------- | ---------------------------- |
| [Scripts README](../scripts/README.md) | CLI tools documentation      |
| [Tests README](../scripts/TESTS.md)    | Test scripts documentation   |
| [Changelog](../changelog/)             | Feature history & migrations |

## 📦 Sample Data

- [Internally Funded Sample](../docs/sample_InternallyFunded2024-2025.xlsx)
- [Externally Funded Sample](../docs/sample_externallyFunded-2024-2025.xlsx)
