# RBAC Context — Starter Kit

## Model RBAC

Three-layer model dengan dua sumber permission yang di-union:

```
User ──► UserRole ──► Roles ──► RolePermission ──► Permissions
                                                         ▲
User ──► TeamMember ──► Team ──► TeamPermission ──────────┘
```

**Efective permissions = union(role permissions, team permissions)** — di-dedupe via `Set`.

- Satu user bisa punya **banyak roles** (meski seed default assign satu)
- Satu user bisa bergabung ke **banyak teams**, masing-masing dengan permissions tersendiri
- Team permissions **tidak override** role permissions — keduanya di-union. Artinya team permissions hanya bisa **menambah** akses, tidak mengurangi
- `super_admin` role adalah magic bypass — tidak perlu punya permission spesifik di DB

---

## Permission Naming Convention

Format: `{module}.{action}`

**10 modules yang di-seed:**

| Module | Keterangan |
|--------|-----------|
| `admin` | Akses umum area admin |
| `dashboard` | Dashboard/overview |
| `user` | Manajemen user |
| `roles` | Manajemen roles |
| `permissions` | Manajemen permissions |
| `log` | Audit logs |
| `settings` | System settings |
| `teams` | Manajemen teams |
| `notifications` | Notifikasi |
| `broadcast` | System broadcast |

**5 actions per module:**

| Action | Keterangan |
|--------|-----------|
| `read` | Baca/view |
| `create` | Buat baru |
| `update` | Edit existing |
| `delete` | Hapus |
| `manage` | Full control (biasanya superset) |

Total: **50 permissions** di-seed otomatis. Contoh: `user.create`, `admin.read`, `settings.manage`.

---

## Role Hierarchy

Tiga roles yang di-seed secara default:

| Role | Permissions | Catatan |
|------|-------------|---------|
| `super_admin` | Semua 50 permissions | Bypass semua permission check di `apiGuard()`, `usePermission()`, `useRole()`, dan `RouteGuard` |
| `admin` | Tidak di-assign otomatis di seed | Perlu assign manual via UI `/dashboard/access` |
| `user` | Semua permissions **kecuali** module `settings` | Assigned otomatis ke setiap user baru via database hook |

**Auto-assignment:** Setiap user baru yang register otomatis mendapat role `user` via `databaseHooks.user.create.after` di `auth.ts`. Ada failsafe di `customSession` yang akan assign role `user` jika user entah bagaimana tidak punya role.

**Super admin bypass:** Dilakukan dengan cek `userRoles.includes('super_admin')` di tiga tempat:
- `apiGuard()` — skip permission check
- `usePermission()` — return `allowed: true`
- `useRole()` — return `allowed: true`
- `RouteGuard` — skip route check

---

## API Guard Pattern

```typescript
// src/app/api/example/route.ts
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';

// Session only (user harus login)
export async function GET() {
  const guard = await apiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;
  // session.user.id, .email, .roles, .permissions
}

// Dengan single permission
export async function POST() {
  const guard = await apiGuard('user.create');
  if (guard.error) return guard.error;
}

// Dengan multiple permission (OR — salah satu cukup)
export async function DELETE() {
  const guard = await apiGuard(['user.delete', 'admin.manage']);
  if (guard.error) return guard.error;
}
```

**Return values on failure:**
- No session → `401 { success: false, error: 'Unauthorized', message: 'Login required' }`
- Rate limited → `429` (dari `rateLimit()`)
- No permission → `403 { success: false, error: 'Forbidden', message: 'Missing required permission: ...' }`

**Super admin:** jika `user.roles.includes('super_admin')`, permission check dilewati — super admin selalu allowed tanpa perlu punya permission di DB.

---

## UI Permission Guard Pattern

### `usePermission(permission: string)`

```typescript
import { usePermission } from '@/lib/rbac/hooks/usePermission';

const { allowed, isLoading } = usePermission('user.create');

// Gunakan isLoading untuk hindari flash of content
if (isLoading) return <Skeleton />;
if (!allowed) return null;
```

Return: `{ allowed: boolean, isLoading: boolean }`

Super admin → selalu `allowed: true`.

---

### `useRole(requiredRoles: string | string[])`

```typescript
import { useRole } from '@/lib/rbac/hooks/useRole';

// Single role
const { allowed, isLoading } = useRole('admin');

// Any of these roles
const { allowed } = useRole(['admin', 'super_admin']);
```

Return: `{ allowed: boolean, isLoading: boolean }`

Logic: OR — cukup match satu dari required roles. Super admin → selalu `allowed: true`.

---

### `<Can>` component

Permission-based conditional render. Gunakan untuk **tombol, form, atau section** yang butuh permission tertentu.

```tsx
import { Can } from '@/lib/rbac/components/can';

// Dasar
<Can permission="user.create">
  <CreateButton />
</Can>

// Dengan fallback
<Can permission="settings.manage" fallback={<p>Tidak punya akses</p>}>
  <SettingsForm />
</Can>

// Dengan loading state
<Can permission="user.delete" loading={<Skeleton />} fallback={null}>
  <DeleteButton />
</Can>
```

Props:
- `permission: string` — satu permission string
- `children: ReactNode` — render jika allowed
- `fallback?: ReactNode` — render jika tidak allowed (default: `null`)
- `loading?: ReactNode` — render saat session loading (default: `null`)

---

### `<Role>` component

Role-based conditional render. Gunakan untuk **section UI** yang dibatasi per role, bukan per permission.

```tsx
import { Role } from '@/lib/rbac/components/role';

<Role role="super_admin" fallback={<p>Admin only</p>}>
  <DangerZone />
</Role>

// Multiple roles (OR)
<Role role={['admin', 'super_admin']}>
  <AdminPanel />
</Role>
```

Props sama dengan `<Can>`, tapi `role: string | string[]` sebagai ganti `permission`.

---

## RouteGuard Pattern

`RouteGuard` di-mount sekali di dashboard layout dan tidak render apapun ke DOM (return `null`). Ia menggunakan `useEffect` yang berjalan setiap kali `pathname` berubah.

**Alur kerja:**
1. Fetch `/api/menus` via SWR (deduplicated 5 menit, no revalidate on focus)
2. Flatten semua URLs dari response (group URLs + child URLs)
3. Pada setiap navigasi:
   - Skip jika masih loading session atau menus
   - Skip jika pathname ada di `WHITELIST`
   - Skip jika bukan route `/dashboard`
   - Skip jika user adalah `super_admin`
   - Cek apakah `pathname` ada di flat authorized URLs list
   - Jika tidak ada → `router.replace('/dashboard/default')`

**Cara register route baru supaya ter-protect:**
- Tambahkan menu item dengan URL baru ke DB (via seed atau UI admin)
- Assign `permissionId` dan `roles` yang sesuai
- RouteGuard otomatis akan enforce — tidak perlu ubah kode

**Cara buat route yang selalu bisa diakses (whitelisted):**
- Tambahkan URL ke array `WHITELIST` di `RouteGuard.tsx`
- Atau buat route di luar `/dashboard`

> **Catatan:** RouteGuard hanya berjalan di client side setelah mount. Ada celah singkat (flash) sebelum redirect terjadi. Proteksi server-side yang lebih ketat ditangani oleh `src/proxy.ts` (Next.js proxy) yang berjalan sebelum request mencapai route handler.

---

## Team Permission System

Teams memberikan cara untuk memberikan permission tambahan ke sekelompok user tanpa mengubah role mereka.

**Union logic (di `customSession`):**
```typescript
const rolePermissions = userWithRelations?.userRoles.flatMap(ur =>
  ur.role.rolePermissions.map(rp => rp.permission.name)
) ?? [];

const teamPermissions = userWithRelations?.teamMembers.flatMap(tm =>
  tm.team.teamPermissions.map(tp => tp.permission.name)
) ?? [];

const allPermissions = [...new Set([...rolePermissions, ...teamPermissions])];
```

**Kapan pakai team vs role:**
- **Role** → akses permanen berdasarkan fungsi user (admin, staff, viewer)
- **Team** → akses sementara atau kontekstual (tim proyek, departemen, task force)

Team permissions tidak bisa **mengurangi** akses dari role — hanya bisa menambah.

`TeamMember.role` field (string: `"LEADER"` atau `"MEMBER"`) adalah metadata tim saja, tidak berpengaruh ke RBAC permission check.

---

## Cara Tambah Permission Baru

1. **Tambah ke seed** — edit `prisma/seed.ts`, tambah module baru ke array `modules` atau gunakan permission yang sudah ada
2. **Jalankan seed** — `npm run seed` (aman dijalankan ulang, pakai upsert)
3. **Assign ke role** — via `/dashboard/access` UI (atau tambah ke seed di bagian role-permission mapping)
4. **Guard API** — `apiGuard('newmodule.action')`
5. **Guard UI** — `<Can permission="newmodule.action">` atau `usePermission('newmodule.action')`

Tidak perlu ubah file RBAC core.

---

## Cara Tambah Role Baru

1. **Tambah ke seed** — edit array `roleNames` di `prisma/seed.ts`
2. **Jalankan seed** — `npm run seed`
3. **Assign permissions** — via `/dashboard/access` UI (pilih role → set permissions)
4. **Assign ke user** — via `/dashboard/users` UI (pilih user → set role)
5. **Gunakan di guard** (opsional) — `<Role role="new_role">` atau `useRole('new_role')`

---

## Cara Tambah Module Baru

1. **Tambah module name** ke array `modules` di `prisma/seed.ts`
2. **Jalankan seed** — akan generate 5 permissions baru (`module.read`, `.create`, `.update`, `.delete`, `.manage`)
3. **Assign ke role** — via `/dashboard/access` atau di seed
4. **Buat API routes** di `src/app/api/[module]/route.ts` dengan `apiGuard('module.action')`
5. **Buat service** di `src/services/[module]/api.ts`
6. **Guard UI components** dengan `<Can permission="module.action">`
7. **Tambah ke permission map** di `src/lib/rbac/permission.ts` jika ada halaman dashboard yang butuh server-side route guard

---

## Cara Tambah Menu Baru

1. **Edit seed** — tambah item ke `menuGroups` di `prisma/seed.ts`:

```typescript
{
  label: 'New Section',
  roles: ['super_admin', 'admin'],
  permission: 'admin.read',           // permission untuk group header
  items: [
    {
      title: 'New Page',
      url: '/dashboard/new-page',
      icon: 'Settings',               // nama icon dari lucide-react
      roles: ['super_admin', 'admin'],
      permission: 'admin.read',       // permission untuk item ini
    },
  ],
}
```

2. **Jalankan seed** — `npm run seed` (semua menu di-clear dan di-recreate)
3. **Buat halaman** di `src/app/dashboard/new-page/page.tsx`
4. Sidebar otomatis update, RouteGuard otomatis enforce — tidak ada kode lain yang perlu diubah

> **Perhatian:** Seed akan **delete semua menu** sebelum recreate. Jika ada menu yang dibuat via UI admin dan tidak ada di seed, menu tersebut akan hilang setelah seed dijalankan ulang.

---

## Flexibility Checklist

Untuk setiap item: apakah bisa dilakukan **tanpa mengubah core library files**?

| Task | Bisa tanpa ubah core? | Cara |
|------|-----------------------|------|
| Tambah role baru | ✅ Ya | Edit seed, jalankan `npm run seed` |
| Tambah permission baru | ✅ Ya | Edit seed, jalankan `npm run seed` |
| Tambah module baru | ✅ Ya | Edit seed + buat API route + service |
| Ubah permission naming convention | ❌ Tidak | Naming hardcoded di seed, apiGuard calls, dan `permission.ts` — perlu update semua |
| Tambah OAuth provider | ✅ Ya | Tambah plugin Better Auth di `auth.ts` (bukan core library) |
| Tambah team baru | ✅ Ya | Via UI `/dashboard/teams` atau Prisma langsung |
| Custom session data | ⚠️ Partial | Perlu edit `customSession` di `auth.ts` dan extend `ExtendedUser` di `src/lib/rbac/types.ts` |
| Custom menu hierarchy | ✅ Ya | Edit seed atau via UI admin — RouteGuard dan sidebar sudah data-driven |
| Assign permission ke team | ✅ Ya | Via UI `/dashboard/teams` |
| Tambah whitelist route ke RouteGuard | ❌ Minor edit | Perlu tambah URL ke `WHITELIST` array di `RouteGuard.tsx` |
| Ubah rate limit | ❌ Minor edit | Ubah nilai `limit` dan `windowMs` di `apiGuard()` |
