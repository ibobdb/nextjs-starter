# Access Management

> **Tanggal**: 2026-03-01  
> **Scope**: Roles, Permissions, dan Role-Permission mapping UI  
> **Guard**: `permission: user.read` — super_admin only

---

## Apa yang Berubah

### Seed

**[MODIFY] `prisma/seed.ts`** — diaktifkan (sebelumnya di-comment), ditambah module `trendscout`.

```
Modules: dashboard, user, trendscout, roles, permissions, log, settings
Actions: read, create, update, delete
Total:   28 permissions × 4 roles = super_admin mapped to all
```

Jalankan ulang: `npm run seed`

---

### API Routes (4 endpoint baru)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/access/roles` | List semua roles + count |
| `POST` | `/api/access/roles` | Buat role baru |
| `PUT` | `/api/access/roles/[id]` | Rename role |
| `DELETE` | `/api/access/roles/[id]` | Hapus role (cascade) |
| `GET` | `/api/access/permissions` | List + grouped by module |
| `GET` | `/api/access/role-permissions?roleId=` | Permissions milik role |
| `POST` | `/api/access/role-permissions` | Assign permission ke role |
| `DELETE` | `/api/access/role-permissions` | Remove permission dari role |

**Guard**: Semua endpoint butuh `user.read` atau lebih. `super_admin` dan `admin` roles tidak bisa dihapus/rename.

---

### Service Layer

**[NEW] `src/services/access/api.ts`** — Client fetch object `accessApi` dengan fungsi: `getRoles`, `createRole`, `deleteRole`, `getPermissions`, `getRolePermissions`, `assignPermission`, `removePermission`.

---

### Halaman `/dashboard/access`

3 Tab dengan underline style:

**Tab 1 — Roles**
- Tabel roles dengan kolom: nama, jumlah permissions, jumlah users
- Tombol tambah role (dengan dialog) — auto-convert ke snake_case
- Tombol hapus per baris (dengan confirm dialog)
- Built-in roles (super_admin, admin) dilindungi dengan badge "built-in" dan tombol hapus di-disable

**Tab 2 — Permissions** *(Read Only)*
- Tabel semua permissions dengan color-coded module badge
- Data dari seed — tidak bisa diedit dari UI

**Tab 3 — Role Permissions**
- Dropdown pilih role
- Checklist semua permissions grouped by module
- Toggle langsung assign/unassign dengan optimistic update
- Per-row loading state saat toggle sedang diproses

---

## File yang Berubah

| File | Status |
|---|---|
| `prisma/seed.ts` | Diperbarui |
| `app/api/access/roles/route.ts` | **BARU** |
| `app/api/access/roles/[id]/route.ts` | **BARU** |
| `app/api/access/permissions/route.ts` | **BARU** |
| `app/api/access/role-permissions/route.ts` | **BARU** |
| `services/access/api.ts` | **BARU** |
| `app/dashboard/access/page.tsx` | Diperbarui |
| `app/dashboard/access/_component/roles-tab.tsx` | **BARU** |
| `app/dashboard/access/_component/permissions-tab.tsx` | **BARU** |
| `app/dashboard/access/_component/role-permissions-tab.tsx` | **BARU** |

---

## Verification Plan (Manual)

> [!IMPORTANT]
> Pastikan sudah jalankan `npm run seed` sebelum testing.  
> Login sebagai user yang memiliki role `super_admin` dengan permission `user.read` ter-assign.

### Test 1 — Halaman terbuka

1. Buka `/dashboard/access`
2. ✅ 3 Tab tampil: Roles, Permissions, Role Permissions

### Test 2 — Tab Roles: create dan delete

1. **Tab Roles** → klik "Tambah Role" → ketik `editor` → klik "Buat Role"
2. ✅ Role `editor` muncul di tabel
3. Klik ikon hapus pada baris `editor` → konfirmasi
4. ✅ Role `editor` hilang dari tabel
5. Coba hapus `super_admin` → tombol hapus disabled

### Test 3 — Tab Permissions: tampil lengkap

1. **Tab Permissions** → semua 28 permissions tampil
2. ✅ Badge warna berbeda per module (trendscout=hijau, user=violet, dll.)

### Test 4 — Tab Role Permissions: toggle

1. **Tab Role Permissions** → pilih role `manager`
2. ✅ Permissions yang sudah di-assign ter-check
3. Toggle centang `trendscout.read` (jika belum di-assign)
4. ✅ Spinner tampil saat loading → centang berubah → toast muncul
5. Logout → login sebagai user dengan role `manager`
6. ✅ Menu TrendScout tampil di sidebar (jika `trendscout.read` di-assign)

### Test 5 — Guard: non-super_admin tidak bisa akses

1. Login sebagai user dengan role `manager`
2. Akses `/dashboard/access`
3. ✅ Redirect ke `/no-access`

---

> Docs ini bagian dari **DBStudio Base Project — Access Management**.
