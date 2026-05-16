---
# RBAC — Role Management

## Overview
Sistem manajemen role: create, assign, revoke, dan delete roles. Role hierarchy dikelola via `src/lib/role-hierarchy.ts`. API routes ada di `src/app/api/access/roles/` dan `src/app/api/users/[id]/roles/`.

## Status
✅ Done — 90%

## Completeness Checklist
- [x] List semua roles (GET `/api/access/roles`)
- [x] Buat role baru via UI (`POST /api/access/roles`) — requires `user.create`
- [x] Update role via UI (`PUT /api/access/roles/[id]`) — requires `user.update`
- [x] Hapus role via UI (`DELETE /api/access/roles/[id]`) — requires `user.delete`
- [x] Assign role ke user (`POST /api/users/[id]/roles`)
- [x] Revoke role dari user (DELETE `/api/users/[id]/roles`)
- [x] Batch replace semua role user (`PUT /api/users/[id]/roles/batch`)
- [x] Role hierarchy check (`canManageRole()`, `canManageUser()`)
- [x] Super admin bypass di semua checks
- [x] Duplicate prevention — unique constraint `[userId, roleId]`
- [ ] Assign multiple roles ke satu user via UI (batch endpoint enforce max 1 role — design inconsistency)
- [ ] Audit log saat role di-assign atau di-revoke

## Flexibility Checklist
- [ ] Role hierarchy hardcoded di `src/lib/role-hierarchy.ts` — level super_admin=1, admin=2, custom=3, user=4. Tidak bisa diubah tanpa edit kode.
- [x] Role baru bisa dibuat via UI tanpa edit kode (auto-assign level 3 "custom")
- [x] Seed roles bisa dikustomisasi di `prisma/seed.ts` array `roleNames`
- [ ] Hanya support 1 role per user di batch endpoint (`src/app/api/users/[id]/roles/batch/route.ts:79`) — padahal schema DB support many-to-many

## Known Issues
- 🟡 **Design inconsistency**: Schema mendukung multiple roles per user (`UserRole` many-to-many), tapi batch endpoint enforce max 1 role (`src/app/api/users/[id]/roles/batch/route.ts:79`). Harus ada keputusan: single role atau multi-role, lalu enforce konsisten.
- 🔵 **Role hierarchy hardcoded**: Level angka di `src/lib/role-hierarchy.ts` tidak bisa diubah via UI atau config. Untuk starter kit yang reusable, ini sebaiknya bisa dikonfigurasi.
- 🟡 **Tidak ada audit log**: Role assignment/revocation tidak tercatat di `AuditLog` table meski schema sudah ada.

## Cara Customize untuk Project Baru
1. Tambah role baru via UI `/dashboard/access` atau edit `prisma/seed.ts` → `roleNames`
2. Untuk ubah hierarchy: edit `ROLE_LEVELS` di `src/lib/role-hierarchy.ts`
3. Untuk multi-role support: hapus constraint di batch endpoint dan update UI

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
