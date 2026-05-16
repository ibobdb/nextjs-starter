# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
npx prisma generate           # Regenerate Prisma client after schema changes
npx prisma db push            # Apply schema changes to DB (no migration file)
npx prisma migrate deploy     # Run pending migrations
npm run seed                  # Seed roles, permissions, menus, and default admin — required on first run

# Deploy pipeline (CI)
npm run deploy        # prisma generate → migrate deploy → build
```

**Default admin credentials after seeding:** `admin@starter.com` / `superadmin123`

## AI Workflow Rules

Baca dan ikuti: `docs/ai-workflow-rules.md`

## Project Reference

- `docs/architecture-context.md` — stack, request flow, data fetching patterns
- `docs/rbac-context.md` — RBAC model, permission naming, guard patterns
- `docs/starter-kit-gaps.md` — gap report dengan prioritas pengerjaan
- `docs/progress-tracker.md` — status tiap modul

## Architecture Overview

**Stack:** Next.js App Router + Better Auth + Prisma (PostgreSQL) + shadcn/ui + Tailwind CSS v4 + SWR

### Request Flow

```
Browser → Next.js Route → RouteGuard (client) → API Route → apiGuard() → Prisma → Response
```

- **`src/lib/api-guard.ts`** — all API routes start with `apiGuard(permission?)`. It validates session (401), checks permissions (403), rate-limits (200 req/60s per user), and super-admins bypass permission checks.
- **`src/lib/rbac/components/RouteGuard.tsx`** — client component wrapping the dashboard layout. Fetches dynamic menus and enforces route-level access by comparing pathname against the user's authorized menu URLs. Does NOT redirect unauthenticated users — that must be handled by middleware or a page-level server guard.
- **`src/lib/auth.ts`** — Better Auth config with a custom session plugin that hydrates `session.user` with `roles[]`, `permissions[]`, and `teams[]` on every request. Session data is fetched fresh from DB on each request; `getServerSession` uses React `cache()` for per-request deduplication only (not a persistent cache).

### RBAC System

Three-layer model:

1. **User → Roles** (UserRole table)
2. **Roles → Permissions** (RolePermission table)
3. **Teams → Permissions** (TeamPermission table — per-team overrides)

Permissions follow `{module}.{action}` naming (e.g., `user.create`, `admin.read`). There are 10 modules × 5 actions = 50 standard permissions seeded by `prisma/seed.ts`.

The session plugin unions all role + team permissions into `session.user.permissions`. API routes call `apiGuard('module.action')` to check this union. `apiGuard()` also accepts an array of permissions (OR logic — any match is sufficient).

**UI permission guards:**
- `usePermission()` / `useRole()` hooks — `src/lib/rbac/hooks/`
- `<Can>` / `<Role>` JSX components — `src/lib/rbac/components/`

### Dynamic Menu System

Menus are stored in the `menu` table with a parent-child hierarchy and an optional `permissionId`. `/api/menus` returns only menus the authenticated user is authorized to see. The sidebar (`app-sidebar.tsx`) is driven entirely by this API response.

### Data Fetching Pattern

- **Server components** — layouts and page roots use RSC for initial data
- **Client components** — use `useData()` hook (`src/hooks/use-data.ts`) which wraps SWR
- **Service layer** — all fetch logic lives in `src/services/*/api.ts`, not inline in components

```typescript
// Standard pattern
const { data, isLoading, error } = useData('cache-key', () => accessApi.getRoles())
```

### API Response Format

All API routes return a consistent shape via `createApiResponse()` (`src/lib/api-response.ts`):

```json
{ "success": boolean, "data": T, "message"?: string, "error"?: string }
```

### Styling

Use semantic CSS tokens defined in `src/app/globals.css` — no hardcoded colors. Reference `bg-success/20`, `text-warning`, etc. All UI primitives come from `src/components/ui/` (shadcn/ui) or `src/components/common/` (app-level wrappers like `AppTable`, `DataLoader`, `PageHeader`).

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Better Auth setup; custom session plugin adding RBAC data |
| `src/lib/api-guard.ts` | Session check + permission check + rate limit for API routes |
| `src/lib/prisma.ts` | Prisma client singleton |
| `prisma/schema.prisma` | Full data model |
| `prisma/seed.ts` | Seeds roles, permissions, menus, admin user, and system config |
| `src/lib/rbac/` | Permission/role hooks, `<Can>`, `<Role>`, `RouteGuard` |
| `src/services/` | API client functions consumed by SWR hooks |

## Environment Variables

Copy `.env.example` to `.env`. Required variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`.
