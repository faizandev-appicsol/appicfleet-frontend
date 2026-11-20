# Frontend features

Each business capability lives in `src/features/<feature>/` with:

- `api/` — RTK Query endpoints
- `pages/` — route screens
- `components/` — feature UI
- `schemas/` — Zod forms
- `types/`
- `hooks/`
- `index.ts`

Shared UI stays in `src/components`. Shared config stays in `src/config`.

Future feature folders (not implemented yet) should mirror backend domains:
organizations, branches, vehicles, customers, bookings, contracts, invoices, payments, etc.
