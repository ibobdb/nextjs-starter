# Category 1: Core Foundation

> **Tanggal**: 2026-03-01  
> **Scope**: Session management terpusat & RBAC components yang robust  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [NEW] `src/hooks/use-session.ts`

Hook baru berbasis **SWR** sebagai sumber data session tunggal untuk seluruh aplikasi.

**Sebelum**: Setiap komponen yang butuh data session memanggil `getSession()` sendiri-sendiri di dalam `useEffect`. Menyebabkan banyak request paralel ke server session.

**Sesudah**: Satu SWR key (`"session"`) di-share ke semua komponen. SWR melakukan deduplication otomatis — tidak peduli berapa banyak komponen yang memanggil `useSession()`, hanya ada satu request aktif.

```ts
// Penggunaan
const { user, isLoading, isAuthenticated, refresh } = useSession()

// user: { id, name, email, image, roles: string[], permissions: string[] }
```

**Konfigurasi SWR**:
- `revalidateOnFocus: true` — session di-refresh saat tab aktif kembali
- `shouldRetryOnError: false` — tidak retry saat error auth
- `dedupingInterval: 5000` — deduplicate request dalam window 5 detik

---

### [MODIFY] `src/lib/rbac/hooks/useRole.ts`

**Sebelum**: Memanggil `getSession()` langsung di dalam `useEffect` dengan `useState`. Tidak expose loading state.

**Sesudah**: Menggunakan `useSession()`. Return type berubah dari `boolean` menjadi `{ allowed: boolean, isLoading: boolean }`.

```ts
// Sebelum
const allowed = useRole(['super_admin']) // boolean

// Sesudah
const { allowed, isLoading } = useRole(['super_admin'])
```

> [!WARNING]
> Breaking change: return type berubah. Komponen yang menggunakan `useRole` langsung perlu di-update.  
> Komponen yang menggunakan `<Role>` tidak terpengaruh karena encapsulasi di dalam component.

---

### [MODIFY] `src/lib/rbac/hooks/usePermission.ts`

Sama seperti `useRole` — refactored ke `useSession()`, return type menjadi `{ allowed, isLoading }`.

---

### [MODIFY] `src/lib/rbac/components/role.tsx`

**Sebelum**: Hanya render `children` atau `null`. Tidak ada loading state, tidak ada fallback.

**Sesudah**: Tiga kondisi render:

| Kondisi | Output |
|---|---|
| Session loading | `loading` prop (default `null`) |
| Tidak punya role | `fallback` prop (default `null`) |
| Punya role | `children` |

```tsx
// Penggunaan baru
<Role role="super_admin" fallback={<NoAccess />} loading={<Skeleton />}>
  <AdminPanel />
</Role>

// Backward compatible (existing usage tidak perlu diubah)
<Role role={["admin", "manager"]}>
  <Content />
</Role>
```

---

### [MODIFY] `src/lib/rbac/components/can.tsx`

Sama seperti `Role` — tambah `fallback` dan `loading` props. Backward compatible.

```tsx
<Can permission="user.create" fallback={<p>Tidak punya akses</p>}>
  <CreateButton />
</Can>
```

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/hooks/use-session.ts` | **BARU** | SWR-based session hook |
| `src/lib/rbac/hooks/useRole.ts` | Diperbarui | Pakai useSession, expose isLoading |
| `src/lib/rbac/hooks/usePermission.ts` | Diperbarui | Pakai useSession, expose isLoading |
| `src/lib/rbac/components/role.tsx` | Diperbarui | Tambah loading & fallback props |
| `src/lib/rbac/components/can.tsx` | Diperbarui | Tambah loading & fallback props |

---

## Verification Plan (Manual)

### Test 1 — Session tidak double-request

1. Buka aplikasi di browser
2. Buka **DevTools → Network tab** → filter `XHR/Fetch`
3. Hard refresh halaman (`Ctrl+Shift+R`)
4. Filter request dengan kata `session` atau `get-session`
5. ✅ **Ekspektasi**: Hanya ada **1 request** session, meskipun sidebar, navbar, dan komponen lain menggunakan session data

---

### Test 2 — Role component loading state

1. Throttle network di DevTools ke **"Slow 3G"**
2. Hard refresh halaman dashboard
3. ✅ **Ekspektasi**: Item sidebar yang di-wrap `<Role>` tidak muncul sebentar lalu menghilang (tidak ada flicker). Item baru muncul setelah session selesai di-load.

---

### Test 3 — Role component fallback

1. Login sebagai user dengan role `manager` (bukan `super_admin`)
2. Navigasi ke halaman dashboard
3. ✅ **Ekspektasi**: Sidebar grup "User & Access" tidak tampil sama sekali (karena tidak ada `fallback` prop, render `null`)

---

### Test 4 — Can component fallback

1. Buka komponen yang menggunakan `<Can permission="user.create">` (jika ada)
2. Login dengan user yang tidak punya permission tersebut
3. ✅ **Ekspektasi**: Konten di dalam `<Can>` tidak tampil; jika ada `fallback` prop, fallback yang muncul

---

### Test 5 — useSession data accuracy

1. Buka Browser DevTools Console
2. Jalankan `document.cookie` → cek ada `better-auth.session_token`
3. Di halaman dashboard, akses sidebar footer — user info yang tampil harus sesuai dengan akun yang login (test dilakukan setelah Category 5: Navigation selesai)

---

> Docs ini bagian dari **DBStudio Base Project** — perubahan ini berlaku untuk semua modul yang dikembangkan di atas DBStudio.
