# Category 4: Router Guard

> **Tanggal**: 2026-03-01  
> **Scope**: Middleware permission map yang akurat untuk semua route  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [MODIFY] `src/lib/rbac/permission.ts`

**Masalah sebelumnya**:
1. Fungsi bernama `getRequirePermisison` (typo double-i)
2. Permission map berisi route yang tidak ada: `/dashboard/default`, `/dashboard/test`, `/dashboard/products`
3. **Tidak ada entry sama sekali** untuk `/dashboard/trendscout/*` — semua halaman TrendScout lolos tanpa permission check
4. Route `/dashboard/users`, `/dashboard/teams`, `/dashboard/access` tidak terdaftar semua

**Sesudah** — fungsi baru `getRequiredPermission()`:

```ts
// Route map yang diperbaiki:
/dashboard/trendscout  → trendscout.read  // BARU
/dashboard/users       → user.read
/dashboard/teams       → user.read        // BARU
/dashboard/access      → user.read        // BARU
/dashboard/analytics   → dashboard.read   // BARU
/dashboard/logs        → dashboard.read   // BARU
/dashboard/settings    → dashboard.read   // BARU
```

**Backward compatibility**: `getRequirePermisison()` (typo lama) tetap ada sebagai `@deprecated` wrapper yang memanggil `getRequiredPermission()` — tidak ada breaking change untuk code yang sudah ada.

---

### [MODIFY] `src/proxy.ts`

**Perubahan**:
1. Panggilan `Permission.getRequirePermisison()` → `Permission.getRequiredPermission()`
2. Redirect setelah login: `/dashboard/default` → `/dashboard` (biarkan `/dashboard` redirect lagi ke default via route handler)
3. Conditional permission check disederhanakan:
   ```ts
   // Sebelum (dobel kondisi)
   if (!isPublicPath) {
     if (requiredPermission && !user?.permissions.includes(...)) { ... }
   }
   
   // Sesudah (single kondisi cleaner)
   if (!isPublicPath && requiredPermission) {
     if (!user?.permissions.includes(...)) { ... }
   }
   ```
4. Ditambahkan komentar untuk setiap blok logika

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/lib/rbac/permission.ts` | Diperbarui | Fix typo, expand route map, deprecated wrapper |
| `src/proxy.ts` | Diperbarui | Pakai getRequiredPermission(), cleanup kondisi |

---

## Verification Plan (Manual)

> [!IMPORTANT]
> Sebelum test, pastikan permission `trendscout.read` sudah ada di database.  
> Cek: `prisma studio` → tabel `permission` → cari row dengan `name = "trendscout.read"`.  
> Jika belum ada, jalankan `npm run seed` atau tambahkan manual.

### Test 1 — TrendScout terlindungi permission

1. Buat user baru tanpa role apapun (atau dengan role yang tidak punya `trendscout.read`)
2. Login sebagai user tersebut
3. Akses `http://localhost:3000/dashboard/trendscout/discovery`
4. ✅ **Ekspektasi**: Redirect ke `/no-access`

---

### Test 2 — User & Access terlindungi

1. Login sebagai user dengan role `manager` (anggap tidak punya `user.read`)
2. Akses `http://localhost:3000/dashboard/teams`
3. ✅ **Ekspektasi**: Redirect ke `/no-access`

---

### Test 3 — Admin/Super Admin bisa akses semua

1. Login sebagai `super_admin`
2. Akses `/dashboard/trendscout/discovery`, `/dashboard/users`, `/dashboard/teams`
3. ✅ **Ekspektasi**: Semua halaman dapat diakses (tidak redirect)

---

### Test 4 — User tidak login

1. Logout dari aplikasi (hapus cookie session)
2. Akses `http://localhost:3000/dashboard/trendscout/discovery`
3. ✅ **Ekspektasi**: Redirect ke `/auth/login?callbackUrl=/dashboard/trendscout/discovery`

---

### Test 5 — Dashboard umum masih accessible

1. Login sebagai user dengan role `manager`
2. Akses `/dashboard` (halaman default)
3. ✅ **Ekspektasi**: Redirect ke `/dashboard/default` dan halaman tampil normal

---

> Docs ini bagian dari **DBStudio Base Project**.
