# Architecture Context — Starter Kit

## Stack

| Package | Version |
|---------|---------|
| Next.js | 16.1.1 |
| React | 19.2.0 |
| Better Auth | 1.3.34 |
| Prisma (PostgreSQL) | 6.19.0 |
| shadcn/ui (Radix UI) | various |
| Tailwind CSS | v4 |
| SWR | 2.4.0 |
| Zod | 4.3.6 |
| React Hook Form | 7.71.2 |
| Resend (email) | 6.4.2 |
| Axios | 1.13.5 |

---

## Request Flow

```
Browser
  └─► proxy.ts (server-side — auth redirect + RBAC permission check)
        └─► Next.js Route Handler
              └─► RouteGuard (client component, layout level)
                    ├─ Redirect if no session
                    └─ Redirect if route not in authorized menu list
              └─► API Route Handler
                    └─► apiGuard(permission?)
                    ├─ 401 if no session
                    ├─ 429 if rate-limited
                    ├─ 403 if permission missing
                    └─ ✅ proceed → Prisma → Response
```

---

## Layer Responsibilities

### RouteGuard (`src/lib/rbac/components/RouteGuard.tsx`)

Client component mounted in the dashboard layout. Runs on every route change.

**What it checks:**
1. Waits for session and menu data to load — does nothing while loading
2. Skips routes in the hardcoded `WHITELIST`: `/dashboard/default`, `/dashboard/no-access`, `/dashboard/profile`
3. Only guards routes under `/dashboard`
4. Super admins (`super_admin` role) bypass all checks
5. For everyone else: compares `pathname` against URLs returned by `/api/menus` (which only returns menus the user is authorized to see)

**On failure:** `router.replace('/dashboard/default')`

> **Note:** RouteGuard does NOT redirect unauthenticated users to a login page — it only guards within the `/dashboard` namespace. Unauthenticated users are intercepted earlier by `src/proxy.ts` before they reach any route.

---

### `apiGuard()` (`src/lib/api-guard.ts`)

Server-side async function called at the top of every protected API route.

**Checks (in order):**
1. **Session** — calls `getServerSession()`. Returns `401` if no session.
2. **Rate limit** — 200 requests per 60 seconds per user (`user_{id}` key). Returns `429` if exceeded.
3. **Permission** — if `requiredPermission` is passed (string or `string[]`):
   - Extracts `user.roles` from the session
   - `super_admin` role → bypass, always allowed
   - Otherwise: checks `user.permissions` (array already in session). If any permission matches → allowed. If none → `403`.

**Usage pattern:**
```typescript
// Session check only
const guard = await apiGuard();
if (guard.error) return guard.error;
const { session } = guard;

// With permission (single)
const guard = await apiGuard('user.create');
if (guard.error) return guard.error;

// With permission (any of these)
const guard = await apiGuard(['user.create', 'admin.manage']);
if (guard.error) return guard.error;
```

---

### Service Layer (`src/services/*/api.ts`)

Pure fetch functions — no state, no hooks. Each module has its own file:

| File | Covers |
|------|--------|
| `src/services/access/api.ts` | Roles, permissions, role-permission mapping, menus |
| `src/services/users/api.ts` | User list, role assignment |
| `src/services/teams/api.ts` | Teams, members, team permissions |
| `src/services/settings/api.ts` | System config (uses axios) |
| `src/services/notifications/api.ts` | Broadcast notifications |
| `src/services/tasks/api.ts` | Background task triggering |

All functions return typed promises matching `ApiResponse<T>`. Most use `fetch`; `settingsApi` uses an axios instance with `baseURL` and `withCredentials`.

---

### Hook Layer (`src/hooks/use-data.ts`)

`useData()` wraps SWR and standardizes data extraction from `ApiResponse<T>`.

**Default behavior:** extracts `response.data` if `response.success === true`, else `undefined`.

```typescript
// Basic
const { data, isLoading, error, refetch } = useData(
  'cache-key',
  () => accessApi.getRoles()
);

// With transform
const { data } = useData(
  'grouped-permissions',
  () => accessApi.getPermissions(),
  { transform: (res) => res.data?.grouped ?? {} }
);

// Conditional (null key = skip fetch)
const { data } = useData(
  isReady ? 'roles' : null,
  () => accessApi.getRoles()
);
```

`revalidateOnFocus` defaults to `false`. `shouldRetryOnError` is always `false`.

---

## Data Fetching Pattern

### Server Components (RSC)
Used for **layouts and page roots** where initial data is needed for SSR. Calls `getServerSession()` (memoized per request via React `cache()`).

```typescript
// app/dashboard/layout.tsx (example)
const session = await getServerSession(await headers());
```

### Client Components
Use `useData()` + service functions for all interactive or user-specific data.

```typescript
'use client';
const { data: roles } = useData('roles', () => accessApi.getRoles());
```

**Rule of thumb:** page shell = RSC, interactive tables/forms = client component with `useData`.

---

## API Response Format

All API routes use `createApiResponse()` from `src/lib/api-response.ts`:

```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string, message: string }
```

HTTP status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `429`, `500`.

`apiGuard()` itself returns raw `NextResponse.json()` on failure — the shape matches the error format above.

---

## Dynamic Menu System

Menus are stored in the `menu` table with parent-child hierarchy:

```
Menu (group/parent — no URL, permissionId optional)
  └─ Menu (item — has URL, icon, permissionId optional)
```

Each menu row can have:
- `permissionId` — a specific permission required to see this item
- `roles[]` via `MenuRole` join table — role-level access control

`/api/menus` (called by RouteGuard and the sidebar) filters menus by the requesting user's session: returns only groups/items where the user has the required role AND permission. The sidebar component (`app-sidebar.tsx`) is entirely data-driven by this response.

**To add a new menu item:** insert into `menu` (or add to `prisma/seed.ts`) with the correct `parentId`, `permissionId`, and roles. No code changes needed.

---

## Session Management

Better Auth is configured with three plugins: `twoFactor`, `admin`, and `customSession`.

The `customSession` plugin runs on every session read:

1. Calls `getUserRolesAndPermissions(userId)` — a Prisma query that fetches `userRoles → role → rolePermissions` and `teamMembers → team → teamPermissions`
2. Auto-heals: if a user has no roles, it auto-assigns the `user` role (failsafe for edge cases where the database hook was skipped)
3. Builds three arrays:
   - `roles` — all role names the user holds
   - `rolePermissions` — all permission names via roles
   - `teamPermissions` — all permission names via team membership
4. Unions both permission arrays (deduped via `Set`) → `permissions`
5. Returns `{ user: { ...user, roles, permissions, teams }, session }`

> **Inaccuracy vs CLAUDE.md:** The comment in `auth.ts` says "Specifically caches roles and permissions for 5 minutes." The code does NOT use `unstable_cache` or any TTL cache. `getServerSession` uses React's `cache()` which is **per-request memoization** (not 5-minute TTL). Each request fetches fresh from the DB.

Session lifetime: `expiresIn: 86400s` (1 day), `updateAge: 3600s` (1 hour).

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | Signing key for sessions/tokens |
| `BETTER_AUTH_URL` | ✅ | Base URL for auth callbacks (e.g. `https://app.com`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL (used in email templates, axios base) |
| `RESEND_API_KEY` | ✅ | Email sending via Resend |
| `TRUSTED_ORIGINS` | optional | Comma-separated extra trusted origins for CORS |

Copy `.env.example` to `.env` before first run.

---

## Key Files Reference

| File | Responsibility |
|------|---------------|
| `src/proxy.ts` | Next.js proxy (replaces middleware) — auth redirect + RBAC permission check per route |
| `src/lib/auth.ts` | Better Auth config; custom session plugin adding `roles`, `permissions`, `teams` to session |
| `src/lib/api-guard.ts` | `apiGuard()` — session + rate limit + permission check for API routes |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/rate-limit.ts` | In-memory rate limiter used by `apiGuard()` |
| `src/lib/api-response.ts` | `createApiResponse()` — standardized API response shape |
| `src/lib/rbac/components/RouteGuard.tsx` | Client-side route protection via dynamic menus |
| `src/lib/rbac/components/can.tsx` | `<Can>` JSX component for permission-gated UI |
| `src/lib/rbac/components/role.tsx` | `<Role>` JSX component for role-gated UI |
| `src/lib/rbac/hooks/usePermission.ts` | `usePermission()` hook |
| `src/lib/rbac/hooks/useRole.ts` | `useRole()` hook |
| `src/lib/rbac/permission.ts` | `Permission` class — server-side helper + route→permission map |
| `src/lib/rbac/types.ts` | `ExtendedUser` / `ExtendedSession` TypeScript types |
| `src/hooks/use-data.ts` | `useData()` — SWR wrapper with `ApiResponse` extraction |
| `src/hooks/use-session.ts` | Session hook used by RBAC hooks |
| `src/services/access/api.ts` | Roles, permissions, menus API client |
| `src/services/users/api.ts` | Users API client |
| `src/services/teams/api.ts` | Teams API client |
| `prisma/schema.prisma` | Full data model |
| `prisma/seed.ts` | Seeds roles, permissions (50), menus, admin user, system config |

---

## Cara Extend untuk Project Baru

### Tambah Module Baru
1. Tambah nama module ke array `modules` di `prisma/seed.ts`
2. Jalankan `npm run seed` (upsert, aman dijalankan ulang)
3. Gunakan `apiGuard('newmodule.action')` di API route
4. Gunakan `<Can permission="newmodule.action">` di UI
5. Tambah permission ke role yang perlu di `/dashboard/access`

### Tambah Role Baru
1. Tambah nama ke array `roleNames` di `prisma/seed.ts`
2. Jalankan `npm run seed`
3. Assign permissions via `/dashboard/access` UI
4. Assign ke user via `/dashboard/users` UI

### Tambah Menu Baru
1. Tambah entry ke `menuGroups` di `prisma/seed.ts` dengan `url`, `icon`, `permission`, dan `roles`
2. Jalankan `npm run seed` (menu di-delete dan di-recreate setiap seed)
3. Sidebar otomatis update — tidak ada perubahan kode

### Tambah API Route Baru
1. Buat file di `src/app/api/[path]/route.ts`
2. Mulai dengan `const guard = await apiGuard('module.action'); if (guard.error) return guard.error;`
3. Tambah service function di `src/services/*/api.ts`
4. Gunakan `useData()` di komponen client

### File yang TIDAK perlu diubah (sudah generic)
- `src/lib/api-guard.ts` — generic, terima permission string apapun
- `src/lib/rbac/hooks/usePermission.ts` — generic
- `src/lib/rbac/hooks/useRole.ts` — generic
- `src/lib/rbac/components/can.tsx` — generic
- `src/lib/rbac/components/role.tsx` — generic
- `src/lib/rbac/components/RouteGuard.tsx` — driven by DB, tidak perlu diubah
- `src/hooks/use-data.ts` — generic SWR wrapper
- `src/lib/api-response.ts` — generic response helper
