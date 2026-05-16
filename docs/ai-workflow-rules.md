# AI Workflow Rules — Starter Kit

## Prinsip Utama

- Ini adalah template — setiap perubahan harus mempertimbangkan dampaknya ke semua project yang akan menggunakan starter kit ini
- Jangan hardcode nilai yang seharusnya configurable (lihat 🔵 gaps di `docs/starter-kit-gaps.md`)
- Core RBAC files tidak boleh diubah untuk kebutuhan spesifik project — extend, jangan modify
- Setiap fitur baru harus mengikuti pattern yang sudah ada, bukan membuat pattern baru

---

## Workflow: Memulai Sesi

1. Baca `docs/progress-tracker.md` untuk tahu status masing-masing modul
2. Baca `docs/starter-kit-gaps.md` untuk konteks gap yang belum terselesaikan
3. Konfirmasi ke user: fitur mana yang akan dikerjakan hari ini
4. Baca `docs/architecture-context.md` atau `docs/rbac-context.md` sesuai area kerja

---

## Workflow: Tambah Module Baru

Urutan wajib:

1. Baca `docs/rbac-context.md` section "Cara Tambah Module Baru"
2. Tambah nama module ke array `modules` di `prisma/seed.ts` (akan generate 5 permissions: `.read`, `.create`, `.update`, `.delete`, `.manage`)
3. Tambah menu entry di `prisma/seed.ts` jika ada halaman dashboard yang perlu ditampilkan di sidebar
4. Jalankan `npm run seed`
5. Buat API route di `src/app/api/{module}/route.ts` — mulai dengan `apiGuard('{module}.{action}')`
6. Buat service di `src/services/{module}/api.ts` — ikuti pattern `src/services/teams/api.ts`
7. Buat halaman UI di `src/app/dashboard/{module}/page.tsx` — ikuti pattern `src/app/dashboard/users/page.tsx`
8. Guard action sensitif di UI dengan `<Can permission="{module}.{action}">`
9. Update `docs/progress-tracker.md` setelah selesai

---

## Workflow: Tambah Fitur Auth

1. Baca `docs/architecture-context.md` section "Session Management"
2. Pastikan menggunakan Better Auth API — jangan bypass dengan custom session logic di luar `src/lib/auth.ts`
3. Setiap endpoint auth baru harus melewati `apiGuard()` untuk rate limiting
4. Jika perlu extend data session, edit hanya `customSession` plugin di `src/lib/auth.ts` dan extend `ExtendedUser` di `src/lib/rbac/types.ts`
5. Update `docs/progress-tracker.md` setelah selesai

---

## Workflow: Ubah RBAC Core

> **PERINGATAN** — perubahan di sini mempengaruhi semua project yang memakai starter kit ini.

1. Baca `docs/rbac-context.md` lengkap sebelum mulai
2. Jelaskan dampak perubahan ke user sebelum coding
3. Pastikan perubahan backward compatible
4. File yang termasuk "RBAC core" (jangan ubah tanpa pertimbangan matang):
   - `src/lib/rbac/components/can.tsx`
   - `src/lib/rbac/components/role.tsx`
   - `src/lib/rbac/components/RouteGuard.tsx`
   - `src/lib/rbac/hooks/usePermission.ts`
   - `src/lib/rbac/hooks/useRole.ts`
   - `src/lib/api-guard.ts`
   - `src/lib/api-response.ts`
   - `src/hooks/use-data.ts`
5. Update `docs/rbac-context.md` setelah ada perubahan schema atau behavior

---

## Workflow: Fix Flexibility Gap

Untuk setiap 🔵 gap di `docs/starter-kit-gaps.md`:

1. Identifikasi apa yang hardcoded
2. Buat jadi configurable via:
   - **Environment variable** — untuk nilai deployment (URL, secret, expiry)
   - **`prisma/seed.ts` parameter** — untuk data default yang bisa berbeda per project
3. Pastikan tidak breaking existing usage (fallback ke nilai lama kalau env tidak di-set)
4. Update Flexibility Checklist di `docs/architecture-context.md`
5. Update status di `docs/starter-kit-gaps.md`

---

## Workflow: Tambah API Route Baru

1. Buat file di `src/app/api/{path}/route.ts`
2. Selalu mulai handler dengan `apiGuard()`:

```typescript
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';

export async function GET() {
  const guard = await apiGuard('{module}.read');
  if (guard.error) return guard.error;
  const { session } = guard;

  try {
    // ... prisma logic
    return NextResponse.json(createApiResponse(true, data));
  } catch (error) {
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
```

3. Gunakan `createApiResponse()` untuk **semua** response — sukses maupun error
4. Handle semua error case secara eksplisit (400 untuk bad input, 404 untuk not found, 500 untuk server error)
5. Tambah service function di `src/services/{module}/api.ts`

**Contoh route terlengkap di codebase:** [`src/app/api/teams/route.ts`](../src/app/api/teams/route.ts)

---

## Workflow: Tambah UI Page Baru

1. Buat file di `src/app/dashboard/{module}/page.tsx` sebagai client component
2. Ikuti struktur ini:

```typescript
'use client';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useData } from '@/hooks/use-data';
import { Can } from '@/lib/rbac/components/can';
import { moduleApi } from '@/services/{module}/api';

export default function ModulePage() {
  const { allowed: canCreate } = usePermission('{module}.create');
  const { data, isLoading, error, mutate } = useData('{module}', () => moduleApi.getAll());

  return (
    <>
      <Can permission="{module}.create">
        <Button onClick={...}>Tambah</Button>
      </Can>
      {/* tabel/konten */}
    </>
  );
}
```

3. Gunakan komponen dari `src/components/common/` (`AppTable`, `DataLoader`, `PageHeader`) bukan buat dari scratch
4. Gunakan semantic CSS token — tidak boleh hardcode warna (misal `bg-red-500`), pakai `bg-destructive`

**Contoh UI page terlengkap di codebase:** [`src/app/dashboard/users/page.tsx`](../src/app/dashboard/users/page.tsx)

---

## Workflow: Tambah Service Baru

Buat `src/services/{module}/api.ts` dengan struktur:

```typescript
import { ApiResponse } from '@/types/api';

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? 'Request failed');
  return json;
}

export const moduleApi = {
  getAll(): Promise<ApiResponse<Item[]>> {
    return fetch('/api/{module}').then(handleRes<ApiResponse<Item[]>>);
  },
  create(data: CreateInput): Promise<ApiResponse<Item>> {
    return fetch('/api/{module}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleRes<ApiResponse<Item>>);
  },
};
```

**Contoh service terlengkap di codebase:** [`src/services/teams/api.ts`](../src/services/teams/api.ts)

---

## Workflow: Tambah Menu Baru

1. Edit array `menuGroups` di `prisma/seed.ts`:

```typescript
{
  label: 'Nama Grup',
  roles: ['super_admin', 'admin'],
  permission: 'module.read',
  items: [
    {
      title: 'Nama Halaman',
      url: '/dashboard/nama-halaman',
      icon: 'Settings',           // nama icon dari lucide-react
      roles: ['super_admin', 'admin'],
      permission: 'module.read',
    },
  ],
}
```

2. Jalankan `npm run seed` — semua menu di-clear dan di-recreate
3. Buat halaman di `src/app/dashboard/nama-halaman/page.tsx`

> Sidebar dan RouteGuard otomatis update — tidak ada kode lain yang perlu diubah.

**Contoh seed terlengkap:** [`prisma/seed.ts`](../prisma/seed.ts)

---

## Workflow: Selesai Task

Lakukan ini setiap selesai task **tanpa perlu diminta**:

1. Update status di `docs/progress-tracker.md` (ubah 🔄 ke ✅ atau update persentase)
2. Update `docs/starter-kit-gaps.md` kalau ada gap yang sudah terselesaikan
3. Kalau ada pattern baru yang muncul, update `docs/ai-workflow-rules.md` section "Referensi Pattern Codebase"

---

## Referensi Pattern Codebase

| Pattern | File Terbaik |
|---------|-------------|
| API route (apiGuard + error handling) | [`src/app/api/teams/route.ts`](../src/app/api/teams/route.ts) |
| UI page (permission guard + useData) | [`src/app/dashboard/users/page.tsx`](../src/app/dashboard/users/page.tsx) |
| Service layer | [`src/services/teams/api.ts`](../src/services/teams/api.ts) |
| Seed pattern (permission upsert) | [`prisma/seed.ts`](../prisma/seed.ts) |
| API guard implementation | [`src/lib/api-guard.ts`](../src/lib/api-guard.ts) |
| Response format | [`src/lib/api-response.ts`](../src/lib/api-response.ts) |
| SWR wrapper | [`src/hooks/use-data.ts`](../src/hooks/use-data.ts) |

---

## Batasan & Larangan

- **Jangan hardcode permission string di UI** — string permission harus sama persis dengan yang ada di DB; typo tidak akan error tapi akan diam-diam deny akses
- **Jangan bypass `apiGuard()`** di API route manapun — tidak ada pengecualian
- **Jangan buat custom session logic** di luar `src/lib/auth.ts`
- **Jangan ubah format `createApiResponse()`** — format ini dipakai oleh `useData()` untuk extract data
- **Jangan buat pattern fetch baru** di luar `useData()` + service layer di client components
- **Jangan simpan state sensitif** (token, session data) di `localStorage`
- **Jangan edit core RBAC files** untuk kebutuhan project spesifik — extend via komposisi
- **Jangan jalankan seed di production** tanpa ganti `SEED_ADMIN_PASSWORD` via env var terlebih dahulu

---

## Checklist Sebelum PR / Commit

- [ ] Semua API route baru mulai dengan `apiGuard()`?
- [ ] Semua response API menggunakan `createApiResponse()`?
- [ ] Semua action sensitif di UI dibungkus `<Can permission="...">`?
- [ ] Tidak ada nilai hardcoded yang seharusnya configurable via env?
- [ ] Seed masih bisa dijalankan clean di DB baru (`npm run seed`)?
- [ ] Pattern konsisten dengan contoh terbaik yang ada di codebase?
- [ ] `docs/progress-tracker.md` sudah diupdate?

---

## Kalau Tidak Yakin

1. Jelaskan situasinya ke user — jangan diam-diam ambil keputusan
2. Berikan 2–3 opsi dengan trade-off yang jelas
3. Prioritaskan opsi yang paling flexible dan reusable untuk starter kit
4. Tunggu keputusan user sebelum mulai coding
