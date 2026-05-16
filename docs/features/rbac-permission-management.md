---
# RBAC — Permission Management

## Overview
Sistem 50 permissions seeded otomatis dengan pola `{module}.{action}`. Mapping role → permission dikelola via `RolePermission` table. API routes di `src/app/api/access/permissions/` dan `src/app/api/access/role-permissions/`.

## Status
✅ Done — 90%

## Completeness Checklist
- [x] List semua permissions dikelompokkan per module (`GET /api/access/permissions`)
- [x] Assign permission ke role (`POST /api/access/role-permissions`)
- [x] Revoke permission dari role (`DELETE /api/access/role-permissions`)
- [x] Batch replace semua permission untuk role (`PUT /api/access/role-permissions/batch`)
- [x] Hierarchy check — tidak bisa assign permission ke role yang lebih tinggi dari dirinya
- [x] Super admin bypass
- [x] 50 permissions seeded otomatis (10 modules × 5 actions)
- [ ] Sync permissions endpoint (`POST /api/access/sync-permissions`) — direferensikan di `src/services/access/api.ts:77` tapi route tidak ditemukan
- [ ] Tambah module baru via UI (harus lewat seed + re-seed)
- [ ] Audit log saat permission di-assign atau di-revoke

## Flexibility Checklist
- [ ] Module list hardcoded di `prisma/seed.ts` array `modules` — perlu jalankan ulang seed untuk tambah module
- [ ] Permission naming convention (`{module}.{action}`) hardcoded di seed dan di banyak `apiGuard()` calls — ubah convention = refactor masif
- [x] Actions per module bisa dikustomisasi di `prisma/seed.ts` array `actions`
- [x] Permission check di API cukup string biasa — tidak ada compile-time validation
- [x] Bisa gunakan custom permission string di luar 50 yang di-seed (manual insert ke DB)

## Known Issues
- 🔴 **Missing `/api/access/sync-permissions` endpoint**: Direferensikan di `src/services/access/api.ts:77` sebagai `syncPermissions()`, tapi route handler tidak ditemukan. Jika service ini dipanggil, akan 404.
- 🔵 **Module hardcoded**: Tambah module baru perlu edit `prisma/seed.ts` dan jalankan ulang seed. Tidak bisa via UI.
- 🟡 **Tidak ada audit log**: Permission assignment tidak tercatat di `AuditLog`.

## Cara Customize untuk Project Baru
1. Tambah module: edit array `modules` di `prisma/seed.ts` → `npm run seed`
2. Tambah custom action: edit array `actions` di `prisma/seed.ts` → `npm run seed`
3. Guard API: `apiGuard('newmodule.action')`
4. Guard UI: `<Can permission="newmodule.action">`
5. Assign permission ke role: via UI `/dashboard/access` atau tambah di seed

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
